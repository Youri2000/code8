import { randomInt } from "node:crypto";

import type { DbOrTx } from "@/server/db/client";
import {
  findEarliestMembership,
  findMembershipBySlug,
  insertMember,
  insertWorkspace,
  type Membership,
  type WorkspaceRow,
} from "@/server/db/workspaces";

const SLUG_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

/** 10 位随机 slug（约 3.6×10^15 种组合），与名称无关，因此中文名也能得到可读的 URL。 */
function generateSlug(): string {
  return Array.from({ length: 10 }, () => SLUG_ALPHABET[randomInt(SLUG_ALPHABET.length)]).join("");
}

function defaultWorkspaceName(userName: string): string {
  const name = userName.trim();
  return name ? `${name} 的工作区` : "我的工作区";
}

/** 新 User 的第一个工作区：Workspace 与 Owner 身份的 Member 在同一事务中创建。 */
export async function createDefaultWorkspace(
  db: DbOrTx,
  { userId, userName }: { userId: string; userName: string },
): Promise<WorkspaceRow> {
  return db.transaction(async (tx) => {
    const workspace = await insertWorkspace(tx, {
      name: defaultWorkspaceName(userName),
      slug: generateSlug(),
    });
    await insertMember(tx, { workspaceId: workspace.id, userId, role: "owner" });
    return workspace;
  });
}

/**
 * 登录后落地的工作区。User 没有任何工作区时（例如注册时创建工作区失败）补建一个，
 * 保证每个 User 至少属于一个工作区。
 */
export async function ensureHomeWorkspace(
  db: DbOrTx,
  user: { id: string; name: string },
): Promise<WorkspaceRow> {
  const existing = await findEarliestMembership(db, { userId: user.id });
  if (existing) return existing.workspace;
  return createDefaultWorkspace(db, { userId: user.id, userName: user.name });
}

/** 按 URL 中的 slug 解析当前 User 在该工作区的身份；不是成员时返回 null（对外表现为 404）。 */
export async function getMembership(
  db: DbOrTx,
  { userId, slug }: { userId: string; slug: string },
): Promise<Membership | null> {
  return findMembershipBySlug(db, { userId, slug });
}
