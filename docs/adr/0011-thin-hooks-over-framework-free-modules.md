# Hook 保持很薄，逻辑放在不依赖 React 的纯 TS 模块里

前端逻辑放在不依赖 React 的纯 TypeScript 模块里：`engines/query`（DuckDB 查询引擎、SQL 安全检查、OPFS 缓存）、`features/chart/spec`（ChartSpec 到 ECharts option 的映射，服务端 SSR 和客户端共用）、`features/*/machines`（上传、粘底、Answer 生命周期的状态机，手写成带类型的 reducer，不用 XState）。Hook 只负责把这些模块的状态接到 React 上、管理生命周期，本身几乎没有逻辑。这样核心逻辑可以脱离 React 单独测试，hook 不必再测一遍。

查询引擎是一个模块内的单例，第一次使用时才启动，不通过 Context 注入。它直接使用 DuckDB-WASM 自带的 `AsyncDuckDB`（本身已在 Worker 里运行），不再自己包一层 Worker；下载 Parquet 的方法由调用方传入，所以引擎不知道预签名 URL 和 Server Action 的存在。
