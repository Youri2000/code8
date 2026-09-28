# AI 输出受约束的 ChartSpec，而不是 ECharts option

AI 回答里的图表部分是一份我们自己定义、用 Zod 校验的精简 ChartSpec（图表类型、x/y 字段映射、聚合方式、排序等），由前端再映射成 ECharts option。之所以不让 AI 直接输出 ECharts option，是因为：输出可以按 schema 校验，失败了能重试；主题、暗色模式、交互由我们统一控制；用户能在不经过 AI 的情况下手动调整图表。代价是 ChartSpec 能表达的图表种类有限，新增图表类型需要同时扩展 schema 和映射逻辑。
