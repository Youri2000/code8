# DuckDB-WASM 自托管、单线程运行，Parquet 缓存在 OPFS

DuckDB-WASM 的文件放在自己的域名下（不走公共 CDN，国内访问不稳定），设置 immutable 长缓存；使用单线程的 `eh` 版本，**不开启** COOP/COEP 响应头。多线程版本要求整站处于跨源隔离状态，会影响 OAuth 回跳和第三方资源的加载，而 50MB 以内的数据集用单线程已经足够。

Dataset 的 Parquet 文件**不依赖浏览器的 HTTP 缓存**，而是以 datasetId 为 key 缓存到 OPFS：下载地址是预签名 URL，每次签发都不一样，HTTP 缓存永远不会命中。由于 Dataset 不可修改，这份缓存永远不需要失效，只需要按容量做淘汰。
