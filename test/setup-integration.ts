// 集成测试会写数据库：拒绝连接任何名字里不带 "test" 的数据库，防止误清开发数据。
const url = process.env.DATABASE_URL ?? "";
if (!/test/.test(new URL(url).pathname)) {
  throw new Error(`Integration tests must run against a test database, got: ${url}`);
}
