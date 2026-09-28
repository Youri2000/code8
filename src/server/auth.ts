import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { env, isBuildPhase } from "@/env";
import { db } from "@/server/db/client";
import * as schema from "@/server/db/schema";
import { createDefaultWorkspace } from "@/server/services/workspaces";

/**
 * 身份认证交给 Better Auth（ADR-0001）；Workspace、Member、Role 与授权由我们自己实现。
 */
export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  // 构建阶段没有运行时密钥；运行时必定经过 env 校验，这个占位值不会被用来签名任何会话
  secret: isBuildPhase ? "build-phase-placeholder-never-used-at-runtime" : env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true, autoSignIn: true },
  advanced: { database: { generateId: "uuid" } },
  databaseHooks: {
    user: {
      create: {
        // Better Auth 在注册事务提交之后才调用 after 钩子，因此工作区在我们自己的事务里创建；
        // 若这里失败，进入 /w 时 ensureHomeWorkspace 会补建，保证每个 User 至少有一个工作区。
        after: async (user) => {
          await createDefaultWorkspace(db, { userId: user.id, userName: user.name });
        },
      },
    },
  },
  plugins: [nextCookies()],
});
