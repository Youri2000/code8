/**
 * Server Action 的统一返回格式（PRD「总体架构」）。业务上可预期的错误返回错误码，
 * 只有意料之外的错误才抛出，交给 error.tsx 处理。
 */
export type ActionErrorCode =
  "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "INVALID_INPUT" | "CONFLICT";

export interface ActionError {
  code: ActionErrorCode;
  message: string;
}

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: ActionError };

/** 业务用例中可预期的失败：由 Server Action 包装函数转换为 `{ ok: false, error }`。 */
export class ExpectedError extends Error {
  constructor(
    readonly code: ActionErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ExpectedError";
  }
}
