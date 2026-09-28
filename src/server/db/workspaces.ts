import { and, asc, eq } from "drizzle-orm";

import type { Role } from "@/domain/permissions";

import type { DbOrTx } from "./client";
import { member, workspace } from "./schema";

export type WorkspaceRow = typeof workspace.$inferSelect;
export type MemberRow = typeof member.$inferSelect;
export interface Membership {
  workspace: WorkspaceRow;
  member: MemberRow;
}

// ── 租户解析：还不知道 workspaceId 时，只能以「当前 User」为范围查询 ──────────────

export async function findMembershipBySlug(
  db: DbOrTx,
  { userId, slug }: { userId: string; slug: string },
): Promise<Membership | null> {
  const [row] = await db
    .select({ workspace, member })
    .from(member)
    .innerJoin(workspace, eq(member.workspaceId, workspace.id))
    .where(and(eq(member.userId, userId), eq(workspace.slug, slug)))
    .limit(1);
  return row ?? null;
}

export async function findEarliestMembership(
  db: DbOrTx,
  { userId }: { userId: string },
): Promise<Membership | null> {
  const [row] = await db
    .select({ workspace, member })
    .from(member)
    .innerJoin(workspace, eq(member.workspaceId, workspace.id))
    .where(eq(member.userId, userId))
    .orderBy(asc(member.createdAt))
    .limit(1);
  return row ?? null;
}

// ── 租户内查询：必须带 workspaceId ──────────────────────────────────────────────

export async function findMember(
  db: DbOrTx,
  { workspaceId, userId }: { workspaceId: string; userId: string },
): Promise<MemberRow | null> {
  const [row] = await db
    .select()
    .from(member)
    .where(and(eq(member.workspaceId, workspaceId), eq(member.userId, userId)))
    .limit(1);
  return row ?? null;
}

export async function insertMember(
  db: DbOrTx,
  values: { workspaceId: string; userId: string; role: Role },
): Promise<MemberRow> {
  const [row] = await db.insert(member).values(values).returning();
  return row!;
}

// ── 新建租户 ──────────────────────────────────────────────────────────────────

export async function insertWorkspace(
  db: DbOrTx,
  values: { name: string; slug: string },
): Promise<WorkspaceRow> {
  const [row] = await db.insert(workspace).values(values).returning();
  return row!;
}
