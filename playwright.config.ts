import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

// 端到端测试使用测试数据库；CI 中由工作流环境变量覆盖。
const env = {
  DATABASE_URL: process.env.DATABASE_URL ?? "postgres://wenshu:wenshu@localhost:5432/wenshu_test",
  BETTER_AUTH_SECRET:
    process.env.BETTER_AUTH_SECRET ?? "test-only-secret-not-used-anywhere-real-000",
  BETTER_AUTH_URL: baseURL,
};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    locale: "zh-CN",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // CI 中测试构建产物；本地复用开发服务器
    command: process.env.CI ? `pnpm start --port ${PORT}` : `pnpm dev --port ${PORT}`,
    url: baseURL,
    env,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
