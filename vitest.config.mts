import { fileURLToPath } from "node:url";

import nextEnv from "@next/env";
import { defineConfig } from "vitest/config";

// 按 Next.js 的规则加载 .env*；Vitest 下 NODE_ENV=test，因此读取 .env.test 而不是 .env.local。
nextEnv.loadEnvConfig(process.cwd());

const path = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path("./src"),
      "server-only": path("./test/stubs/server-only.ts"),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["src/**/*.test.{ts,tsx}"],
          exclude: ["src/**/*.int.test.ts"],
          environment: "node",
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["src/**/*.int.test.ts"],
          environment: "node",
          setupFiles: ["./test/setup-integration.ts"],
          // 共享同一个测试数据库，文件之间串行执行
          fileParallelism: false,
        },
      },
    ],
  },
});
