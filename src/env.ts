import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * 环境变量的唯一入口：缺失或格式错误时，服务启动即失败（见 src/instrumentation.ts）。
 * 新增变量时同步更新 .env.example。
 */
export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },
  client: {},
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
  emptyStringAsUndefined: true,
});
