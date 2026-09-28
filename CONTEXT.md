# 问数（WenShu）

对话式数据分析，面向团队的 SaaS 产品：用户上传表格数据，用自然语言提问，由 AI 生成图表，再把图表整理成可协作、可分享的看板。

## Language

### 租户与身份

**Workspace（工作区）**:
租户边界，所有数据集、会话、看板都归属于且仅归属于一个工作区。用户注册时会自动创建一个普通 Workspace，没有"个人"与"团队"之分。每个工作区至少有一个 Owner。
_Avoid_: Team, Organization, Tenant, Project, Personal workspace

**User（用户）**:
一个登录身份，可以同时属于多个工作区。
_Avoid_: Account

**Member（成员）**:
某个 User 在某个 Workspace 中的身份，带有一个 Role。成员离开后，他创建的内容仍然留在工作区，创建者显示为"前成员"。
_Avoid_: Collaborator, Seat

**Role（角色）**:
Member 在工作区内的权限级别，只有三种：Owner（管理成员与工作区）、Editor（上传数据、对话、编辑看板）、Viewer（只读）。
_Avoid_: Permission level, Admin

**Invite Link（邀请链接）**:
以指定 Role 加入某个工作区的一次性入口。
_Avoid_: Invitation email

**Guest（访客）**:
点击"一键体验"时临时创建的 User，自动获得一份演示工作区的副本并担任其 Owner，24 小时后连同数据和 Share Link 一并清理。Guest 不能创建 Invite Link，也不能新建工作区。
_Avoid_: Demo account, Anonymous user

**AI Quota（AI 配额）**:
每个 User 每天（按北京时间计算）可以提出的 Question 数量上限，跨所有工作区合并计算。AI 内部为修正错误而自动重试的调用不计入；因系统原因"失败"的 Answer 会退还额度，用户自己中断的不退。
_Avoid_: Credits, Limit

### 分析

**Dataset（数据集）**:
上传后不可修改的一份表格数据，带有列结构。重新上传更新后的文件会得到一个新的 Dataset，而不是修改旧的。删除 Dataset 会一并删除它的 Conversation，但已经 Pin 到 Board 的 Chart 会保留下来。
_Avoid_: Table, File, Data source

**Profile（数据概览）**:
Dataset 每一列的类型与统计摘要（空值率、去重数、最小值和最大值、分布）。
_Avoid_: Summary, Schema, Stats

**Column Description（列说明）**:
用户为 Dataset 的某一列补充的业务含义，会作为上下文提供给 AI。
_Avoid_: Column comment, Annotation

**Conversation（分析会话）**:
针对单个 Dataset 的一段多轮自然语言问答。工作区所有成员都能查看，只有创建者能继续追问。
_Avoid_: Chat, Session, Thread

**Question（提问）/ Answer（回答）**:
Conversation 由成对的 Question 与 Answer 组成。一个 Answer 包含一段结论文字、最多一个 Chart，以及生成该 Chart 的查询。
_Avoid_: Message, Reply, Prompt

**Answer 状态**:
生成中、已完成、已中断（用户中途离开，可以重新生成）、失败（系统或模型出错，可以重新生成，并退还额度）四种之一。
_Avoid_: Pending, Error, Cancelled

**Suggested Question（推荐问题）**:
根据 Dataset 的列结构生成的示例提问，出现在新会话的空状态里，以及 AI 无法回答时的 Answer 中。
_Avoid_: Prompt template, Hint

**Fork（复制会话）**:
非创建者把别人的 Conversation 复制成自己名下的新 Conversation，以便继续追问。
_Avoid_: Clone, Duplicate, Branch

**Chart（图表）**:
一次查询加上一份描述"如何把查询结果画出来"的图表说明。
_Avoid_: Widget, Visualization, Card

**Pin（固定）**:
把会话里的某个 Chart 连同它的 Snapshot 复制一份放进 Board 的动作。复制后两者互相独立，此后各改各的。
_Avoid_: Save, Add to board

**Snapshot（快照）**:
每个 Chart 持有的查询结果，在 Chart 生成或字段被修改时产生，查看图表时直接用它渲染。来源 Dataset 被删除后，Chart 仍然按 Snapshot 显示，但不能再修改字段。
_Avoid_: Cache, Result set

### 展示与分享

**Board（看板）**:
由若干被 Pin 进来的 Chart 排版而成的集合，这些 Chart 可以来自不同的 Dataset。Board 上的 Chart 只能手动调整；想让 AI 修改，要回到 Conversation 里重新提问。
_Avoid_: Dashboard, Report, Page

**Share Link（分享链接）**:
Board 的公开只读入口，打开时看到的是 Board 的最新状态。一个 Board 可以有多个 Share Link，每个链接可以单独设置过期时间、单独撤销。通过它只能看到图表，看不到原始数据和会话内容。
_Avoid_: Public link, Embed
