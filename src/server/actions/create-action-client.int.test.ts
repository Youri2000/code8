import { afterAll, describe, expect, it } from "vitest";
import { z } from "zod";

import type { Role, RolePermission } from "@/domain/permissions";
import { ExpectedError } from "@/lib/action-result";
import { insertMember } from "@/server/db/workspaces";
import { closeDb, createTestUser, withRollback, type Tx } from "@/server/db/testing";
import { createDefaultWorkspace } from "@/server/services/workspaces";

import { createActionClient } from "./create-action-client";

afterAll(closeDb);

const signedInAs = (tx: Tx, userId: string | null) =>
  createActionClient({ db: tx, getUserId: () => Promise.resolve(userId) });

/** 一个工作区：Owner 建立，另外按需加入指定 Role 的成员。 */
async function setup(tx: Tx, role?: Role) {
  const owner = await createTestUser(tx);
  const ws = await createDefaultWorkspace(tx, { userId: owner.id, userName: owner.name });
  if (!role || role === "owner") return { workspaceId: ws.id, actorId: owner.id };
  const actor = await createTestUser(tx);
  await insertMember(tx, { workspaceId: ws.id, userId: actor.id, role });
  return { workspaceId: ws.id, actorId: actor.id };
}

describe("authed", () => {
  const echo = (tx: Tx, userId: string | null) =>
    signedInAs(tx, userId).authed(z.object({ text: z.string().min(1, "不能为空") }), (ctx, input) =>
      Promise.resolve({ userId: ctx.userId, text: input.text }),
    );

  it("rejects anonymous callers before looking at the input", () =>
    withRollback(async (tx) => {
      expect(await echo(tx, null)({ text: "" })).toEqual({
        ok: false,
        error: { code: "UNAUTHENTICATED", message: "请先登录" },
      });
    }));

  it("reports the first validation problem", () =>
    withRollback(async (tx) => {
      const user = await createTestUser(tx);
      expect(await echo(tx, user.id)({ text: "" })).toEqual({
        ok: false,
        error: { code: "INVALID_INPUT", message: "不能为空" },
      });
    }));

  it("returns the handler result", () =>
    withRollback(async (tx) => {
      const user = await createTestUser(tx);
      expect(await echo(tx, user.id)({ text: "hi" })).toEqual({
        ok: true,
        data: { userId: user.id, text: "hi" },
      });
    }));
});

describe("inWorkspace", () => {
  const schema = z.object({ workspaceId: z.uuid() });
  const guarded = (tx: Tx, userId: string | null, permission: RolePermission) =>
    signedInAs(tx, userId).inWorkspace({ schema, permission }, (ctx) =>
      Promise.resolve({ role: ctx.member.role, workspaceId: ctx.workspaceId }),
    );

  // 按权限矩阵逐个角色检查包装函数的授权结果
  it.each([
    ["owner", "workspace.manage", true],
    ["editor", "workspace.manage", false],
    ["viewer", "workspace.manage", false],
    ["owner", "dataset.upload", true],
    ["editor", "dataset.upload", true],
    ["viewer", "dataset.upload", false],
    ["viewer", "workspace.view", true],
  ] as const)("%s → %s: allowed=%s", (role, permission, allowed) =>
    withRollback(async (tx) => {
      const { workspaceId, actorId } = await setup(tx, role);

      const result = await guarded(tx, actorId, permission)({ workspaceId });

      expect(result).toEqual(
        allowed
          ? { ok: true, data: { role, workspaceId } }
          : { ok: false, error: { code: "FORBIDDEN", message: "你没有权限执行这个操作" } },
      );
    }),
  );

  it("treats another tenant's workspace as not found", () =>
    withRollback(async (tx) => {
      const { workspaceId } = await setup(tx);
      const outsider = await createTestUser(tx);

      expect(await guarded(tx, outsider.id, "workspace.view")({ workspaceId })).toEqual({
        ok: false,
        error: { code: "NOT_FOUND", message: "工作区不存在" },
      });
    }));

  it("converts expected failures from the handler into an error result", () =>
    withRollback(async (tx) => {
      const { workspaceId, actorId } = await setup(tx);
      const failing = signedInAs(tx, actorId).inWorkspace(
        { schema, permission: "workspace.view" },
        () => Promise.reject(new ExpectedError("CONFLICT", "名称已被占用")),
      );

      expect(await failing({ workspaceId })).toEqual({
        ok: false,
        error: { code: "CONFLICT", message: "名称已被占用" },
      });
    }));

  it("lets unexpected errors propagate to the error boundary", () =>
    withRollback(async (tx) => {
      const { workspaceId, actorId } = await setup(tx);
      const crashing = signedInAs(tx, actorId).inWorkspace(
        { schema, permission: "workspace.view" },
        () => Promise.reject(new Error("database is down")),
      );

      await expect(crashing({ workspaceId })).rejects.toThrow("database is down");
    }));
});
