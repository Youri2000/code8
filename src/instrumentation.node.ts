// 在服务开始处理请求之前校验环境变量；配置错误时直接退出进程，
// 而不是带着错误继续监听端口、对每个请求返回 500。
try {
  await import("./env");
} catch (error) {
  console.error(error);
  process.exit(1);
}

export {};
