import { index, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { user } from "./auth";

export const role = pgEnum("role", ["owner", "editor", "viewer"]);

/** 租户边界：所有业务数据都归属于且仅归属于一个 Workspace。 */
export const workspace = pgTable("workspace", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** 某个 User 在某个 Workspace 中的身份。成员离开时删除这一行，他创建的内容保留。 */
export const member = pgTable(
  "member",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: role("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("member_workspace_user_idx").on(t.workspaceId, t.userId),
    index("member_user_idx").on(t.userId),
  ],
);
