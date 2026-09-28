import { eq, inArray } from "drizzle-orm";
import { afterAll, afterEach, expect, it } from "vitest";

import { auth } from "./auth";
import { db } from "./db/client";
import { member, user, workspace } from "./db/schema";
import { closeDb } from "./db/testing";

// 注册走 Better Auth 自己的数据库连接，无法用事务回滚隔离，测试后手动清理
const createdUserIds: string[] = [];

afterEach(async () => {
  if (createdUserIds.length === 0) return;
  const owned = await db
    .select({ id: member.workspaceId })
    .from(member)
    .where(inArray(member.userId, createdUserIds));
  if (owned.length > 0) {
    await db.delete(workspace).where(
      inArray(
        workspace.id,
        owned.map((row) => row.id),
      ),
    );
  }
  await db.delete(user).where(inArray(user.id, createdUserIds));
  createdUserIds.length = 0;
});

afterAll(closeDb);

it("signing up creates the User together with a Workspace they own", async () => {
  const email = `signup-${crypto.randomUUID()}@wenshu.test`;

  const result = await auth.api.signUpEmail({
    body: { name: "小张", email, password: "correct-horse-battery" },
  });
  createdUserIds.push(result.user.id);

  const memberships = await db
    .select({ role: member.role, name: workspace.name })
    .from(member)
    .innerJoin(workspace, eq(member.workspaceId, workspace.id))
    .where(eq(member.userId, result.user.id));
  expect(memberships).toEqual([{ role: "owner", name: "小张 的工作区" }]);
});
