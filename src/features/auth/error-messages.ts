const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "邮箱或密码不正确",
  USER_ALREADY_EXISTS: "这个邮箱已经注册过了，请直接登录",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "这个邮箱已经注册过了，请直接登录",
  PASSWORD_TOO_SHORT: "密码至少需要 8 个字符",
  PASSWORD_TOO_LONG: "密码不能超过 128 个字符",
  INVALID_EMAIL: "邮箱格式不正确",
};

/** 把 Better Auth 的错误转换成给用户看的中文提示。 */
export function authErrorMessage(error: { code?: string | undefined; status?: number }): string {
  if (error.status === 429) return "尝试次数太多，请稍后再试";
  return (error.code && MESSAGES[error.code]) ?? "出了点问题，请稍后再试";
}
