import { db, type Tx } from "./client";
import { user } from "./schema";

export type { Tx };

class Rollback extends Error {}

/**
 * 集成测试的数据隔离：在事务中运行 fn，结束后一律回滚，测试之间不留下任何数据。
 */
export async function withRollback(fn: (tx: Tx) => Promise<void>): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      await fn(tx);
      throw new Rollback();
    });
  } catch (error) {
    if (!(error instanceof Rollback)) throw error;
  }
}

export async function closeDb(): Promise<void> {
  await db.$client.end();
}

let userSeq = 0;

/** 直接写入一个 User（不经过 Better Auth），用于业务用例层的测试。 */
export async function createTestUser(
  tx: Tx,
  overrides: Partial<{ name: string; email: string }> = {},
): Promise<{ id: string; name: string; email: string }> {
  userSeq += 1;
  const [row] = await tx
    .insert(user)
    .values({
      name: overrides.name ?? `测试用户${userSeq}`,
      email: overrides.email ?? `user-${userSeq}-${crypto.randomUUID()}@wenshu.test`,
    })
    .returning({ id: user.id, name: user.name, email: user.email });
  return row!;
}
