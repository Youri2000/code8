import { afterEach, describe, expect, it, vi } from "vitest";

// env.ts 在导入时读取并校验 process.env，每个用例重新导入一次。
async function loadEnv() {
  vi.resetModules();
  return (await import("./env")).env;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("env", () => {
  it("exposes a valid DATABASE_URL", async () => {
    vi.stubEnv("DATABASE_URL", "postgres://u:p@localhost:5432/db");
    const env = await loadEnv();
    expect(env.DATABASE_URL).toBe("postgres://u:p@localhost:5432/db");
  });

  it.each([
    ["missing", ""],
    ["malformed", "not-a-url"],
  ])("fails fast when DATABASE_URL is %s", async (_, value) => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.stubEnv("DATABASE_URL", value);
    await expect(loadEnv()).rejects.toThrow("Invalid environment variables");
  });
});
