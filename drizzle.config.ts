import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// 与 Next.js 相同的规则加载 .env*，让 drizzle-kit 和应用读取同一份配置。
loadEnvConfig(process.cwd());

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set; copy .env.example to .env.local");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
