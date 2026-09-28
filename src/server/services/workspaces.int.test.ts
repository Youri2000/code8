import { eq } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";

import { member, workspace } from "@/server/db/schema";
import { closeDb, createTestUser, withRollback } from "@/server/db/testing";

import { createDefaultWorkspace, ensureHomeWorkspace, getMembership } from "./workspaces";

afterAll(closeDb);

describe("createDefaultWorkspace", () => {
  it("creates the workspace and its Owner membership together", () =>
    withRollback(async (tx) => {
      const user = await createTestUser(tx, { name: "小王" });

      const created = await createDefaultWorkspace(tx, { userId: user.id, userName: user.name });

      expect(created.name).toBe("小王 的工作区");
      expect(created.slug).toMatch(/^[a-z0-9]{10}$/);
      const members = await tx.select().from(member).where(eq(member.workspaceId, created.id));
      expect(members).toEqual([expect.objectContaining({ userId: user.id, role: "owner" })]);
    }));

  it("falls back to a generic name when the user has no name", () =>
    withRollback(async (tx) => {
      const user = await createTestUser(tx, { name: "  " });
      const created = await createDefaultWorkspace(tx, { userId: user.id, userName: user.name });
      expect(created.name).toBe("我的工作区");
    }));

  it("leaves no workspace behind when the membership cannot be created", () =>
    withRollback(async (tx) => {
      const before = await tx.$count(workspace);

      await expect(
        createDefaultWorkspace(tx, { userId: crypto.randomUUID(), userName: "不存在的用户" }),
      ).rejects.toThrow();

      expect(await tx.$count(workspace)).toBe(before);
    }));
});

describe("ensureHomeWorkspace", () => {
  it("returns the earliest workspace the user belongs to", () =>
    withRollback(async (tx) => {
      const user = await createTestUser(tx);
      const first = await createDefaultWorkspace(tx, { userId: user.id, userName: user.name });
      await createDefaultWorkspace(tx, { userId: user.id, userName: user.name });

      expect((await ensureHomeWorkspace(tx, user)).id).toBe(first.id);
    }));

  it("creates a workspace for a user who has none", () =>
    withRollback(async (tx) => {
      const user = await createTestUser(tx, { name: "小李" });

      const home = await ensureHomeWorkspace(tx, user);

      expect(home.name).toBe("小李 的工作区");
      expect(await getMembership(tx, { userId: user.id, slug: home.slug })).not.toBeNull();
    }));
});

describe("getMembership", () => {
  it("resolves a workspace for its member", () =>
    withRollback(async (tx) => {
      const user = await createTestUser(tx);
      const ws = await createDefaultWorkspace(tx, { userId: user.id, userName: user.name });

      const membership = await getMembership(tx, { userId: user.id, slug: ws.slug });

      expect(membership?.workspace.id).toBe(ws.id);
      expect(membership?.member.role).toBe("owner");
    }));

  it("does not resolve another tenant's workspace", () =>
    withRollback(async (tx) => {
      const alice = await createTestUser(tx);
      const bob = await createTestUser(tx);
      const alicesWorkspace = await createDefaultWorkspace(tx, {
        userId: alice.id,
        userName: alice.name,
      });

      expect(await getMembership(tx, { userId: bob.id, slug: alicesWorkspace.slug })).toBeNull();
    }));

  it("does not resolve an unknown slug", () =>
    withRollback(async (tx) => {
      const user = await createTestUser(tx);
      expect(await getMembership(tx, { userId: user.id, slug: "no-such-ws" })).toBeNull();
    }));
});
