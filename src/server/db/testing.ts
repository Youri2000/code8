import { db, type Db } from "./client";

export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

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
