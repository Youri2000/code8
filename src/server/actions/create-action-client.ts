import type { z } from "zod";

import { can, type Role, type RolePermission } from "@/domain/permissions";
import { ExpectedError, type ActionResult } from "@/lib/action-result";
import type { DbOrTx } from "@/server/db/client";
import { findMember } from "@/server/db/workspaces";

export interface AuthedContext {
  userId: string;
  db: DbOrTx;
}

export interface WorkspaceContext extends AuthedContext {
  workspaceId: string;
  member: { id: string; role: Role };
}

interface Deps {
  /** 当前请求的登录用户；未登录返回 null。 */
  getUserId: () => Promise<string | null>;
  db: DbOrTx;
}

/**
 * Server Action 包装函数。每个 Server Action 本质上都是一个任何人都能调用的公开 POST 接口，
 * 所以统一在这里做：读取会话 → Zod 校验入参 →（工作区操作）校验成员身份与角色 → 执行 → 转换结果。
 *
 * 不依赖 Next.js：会话来源由调用方注入，测试时可以直接传入。
 */
export function createActionClient({ getUserId, db }: Deps) {
  async function run<R>(fn: () => Promise<R>): Promise<ActionResult<R>> {
    try {
      return { ok: true, data: await fn() };
    } catch (error) {
      if (error instanceof ExpectedError) {
        return { ok: false, error: { code: error.code, message: error.message } };
      }
      throw error;
    }
  }

  async function requireUserId(): Promise<string> {
    const userId = await getUserId();
    if (!userId) throw new ExpectedError("UNAUTHENTICATED", "请先登录");
    return userId;
  }

  function parse<S extends z.ZodType>(schema: S, raw: unknown): z.output<S> {
    const result = schema.safeParse(raw);
    if (!result.success) {
      throw new ExpectedError("INVALID_INPUT", result.error.issues[0]?.message ?? "输入不合法");
    }
    return result.data;
  }

  /** 只要求已登录的操作。 */
  function authed<S extends z.ZodType, R>(
    schema: S,
    handler: (ctx: AuthedContext, input: z.output<S>) => Promise<R>,
  ) {
    return async (raw: z.input<S>): Promise<ActionResult<R>> =>
      run(async () => {
        const userId = await requireUserId();
        return handler({ userId, db }, parse(schema, raw));
      });
  }

  /** 工作区内的操作：入参必须带 workspaceId，且当前 User 的 Role 满足 permission。 */
  function inWorkspace<S extends z.ZodType<{ workspaceId: string }>, R>(
    options: { schema: S; permission: RolePermission },
    handler: (ctx: WorkspaceContext, input: z.output<S>) => Promise<R>,
  ) {
    return async (raw: z.input<S>): Promise<ActionResult<R>> =>
      run(async () => {
        const userId = await requireUserId();
        const input = parse(options.schema, raw);
        const member = await findMember(db, { workspaceId: input.workspaceId, userId });
        // 不是成员时与「不存在」表现一致，不泄露其他租户的工作区是否存在
        if (!member) throw new ExpectedError("NOT_FOUND", "工作区不存在");
        if (!can({ userId, role: member.role }, options.permission)) {
          throw new ExpectedError("FORBIDDEN", "你没有权限执行这个操作");
        }
        return handler(
          {
            userId,
            db,
            workspaceId: input.workspaceId,
            member: { id: member.id, role: member.role },
          },
          input,
        );
      });
  }

  return { authed, inWorkspace };
}
