import { sql } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";

import { db } from "./client";
import { closeDb, withRollback } from "./testing";

afterAll(closeDb);

describe("withRollback", () => {
  it("lets a test write inside its transaction", async () => {
    await withRollback(async (tx) => {
      await tx.execute(sql`create table rollback_probe (id int)`);
      await tx.execute(sql`insert into rollback_probe values (1)`);
      const rows = await tx.execute(sql`select count(*)::int as n from rollback_probe`);
      expect(rows[0]).toEqual({ n: 1 });
    });
  });

  it("leaves nothing behind for the next test", async () => {
    const rows = await db.execute(sql`select to_regclass('rollback_probe') as t`);
    expect(rows[0]).toEqual({ t: null });
  });

  it("still surfaces real errors from the test body", async () => {
    await expect(withRollback(() => Promise.reject(new Error("boom")))).rejects.toThrow("boom");
  });
});
