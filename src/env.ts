import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * 环境变量的唯一入口：缺失或格式错误时，服务启动即失败（见 src/instrumentation.node.ts）。
 * 新增变量时同步更新 .env.example。
 *
 * `next build` 阶段跳过校验：构建产物不应依赖运行时密钥，同一个镜像才能部署到不同环境；
 * 服务启动时仍会完整校验。
 */
/** 当前是否处于 `next build` 阶段（此时不校验、也不应使用运行时环境变量）。 */
export const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },
  client: {},
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
  emptyStringAsUndefined: true,
  skipValidation: isBuildPhase,
});
