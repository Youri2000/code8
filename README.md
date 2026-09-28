# 问数（WenShu）

对话式数据分析 SaaS：团队上传表格数据，用中文提问，AI 生成图表，再整理成可以协作、可以安全分享的看板。

- 产品规格（PRD）：[docs/prd/0001-wenshu-v1.md](docs/prd/0001-wenshu-v1.md)
- 术语表：[CONTEXT.md](CONTEXT.md)
- 架构决策：[docs/adr/](docs/adr/)

## 本地开发

需要：Node 24（见 `.nvmrc`）、Docker。pnpm 版本由 `package.json` 的 `packageManager` 字段锁定，通过 Corepack 自动启用。

```bash
nvm use                 # 切换到 .nvmrc 指定的 Node 版本
corepack enable pnpm    # 启用锁定版本的 pnpm
pnpm install

cp .env.example .env.local
pnpm db:up              # 启动 Postgres 和 S3 兼容存储（RustFS）
pnpm db:migrate         # 执行数据库迁移
pnpm dev                # http://localhost:3000
```

停止依赖服务：`pnpm db:down`。

## 常用命令

| 命令                                | 作用                                                           |
| ----------------------------------- | -------------------------------------------------------------- |
| `pnpm lint`                         | ESLint（含分层与 feature 边界检查）                            |
| `pnpm typecheck`                    | 生成路由类型后执行 TypeScript 检查                             |
| `pnpm format` / `pnpm format:check` | Prettier 格式化 / 检查                                         |
| `pnpm test`                         | 单元测试（纯函数、状态机、图表渲染）                           |
| `pnpm test:int`                     | 集成测试，连接 `.env.test` 中的测试数据库（需先 `pnpm db:up`） |
| `pnpm db:generate`                  | 根据表结构变更生成迁移文件（提交到仓库）                       |
| `pnpm db:migrate`                   | 执行迁移                                                       |
| `pnpm db:studio`                    | 打开 Drizzle Studio                                            |

## 协作约定

- 每个 Issue 开一个短期分支（如 `feat/12-share-link`），通过 PR squash 合并到 `main`，CI 全部通过才能合并。
- 提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/)，由 commitlint 在提交时检查；lint-staged 在提交前检查改动过的文件。
- 数据库结构变更只能通过 `pnpm db:generate` 生成并提交的迁移文件；禁止在生产环境使用 `drizzle-kit push`。
