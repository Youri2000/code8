# Next.js 全栈单体，业务规则和授权集中在业务用例层

不单独写后端服务。应用分三层：`app/` 路由层只做请求适配；`server/services/` 业务用例层承载全部业务规则和授权，不依赖任何 Next.js API；`server/db/` 数据访问层的每个函数都强制要求传入 workspaceId。写操作一律用 Server Action，由统一的包装函数完成入参校验、身份和角色校验；读操作由 RSC 直接调用业务用例层；Route Handler 只用于 AI 流式输出、签发预签名 URL、拉取快照和定时任务入口。middleware 只做"未登录就重定向"这一件事，不承担授权（参见 CVE-2025-29927：middleware 可以被整个绕过）。

## Considered Options

- **独立后端（NestJS、Hono 或 Go）+ REST**：工作量翻倍，多一套接口契约和一次部署，与"偏前端、规模适中"的定位不符。业务用例层保持独立于框架，将来需要拆分时成本不高。
- **Postgres RLS 做租户隔离**：配合 Drizzle 和连接池时，需要在每个事务里设置会话变量，复杂度不低。v1 用数据访问层的约束加上"跨租户访问"的集成测试来保证隔离，RLS 留到 v2。
