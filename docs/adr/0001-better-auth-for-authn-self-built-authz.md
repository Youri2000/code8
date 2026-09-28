# 身份认证用 Better Auth，授权自行实现

身份认证（会话、邮箱密码、GitHub OAuth、密码哈希）交给自托管的 Better Auth；Workspace、Member、Role 以及路由和 Server Action 里的权限校验由我们自己实现，**刻意不使用** Better Auth 自带的 organization 插件。

## Considered Options

- **Clerk**：托管服务，接入最快，但鉴权流程不受我们控制，用户数据在第三方，也没有什么可讲的工程细节。
- **Better Auth + organization 插件**：能省掉成员和角色建模，但工作区模型会受插件约束（比如 Guest 的临时工作区、Viewer 的只读语义），而授权恰恰是本项目要亲手做、要讲清楚的部分。
- **全部自研**：密码存储、OAuth state 校验、会话轮换都容易出错，不值得承担这个风险。
