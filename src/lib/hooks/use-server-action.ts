"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import type { ActionError, ActionErrorCode, ActionResult } from "@/lib/action-result";

const MESSAGES: Record<Exclude<ActionErrorCode, "INVALID_INPUT" | "CONFLICT">, string> = {
  UNAUTHENTICATED: "登录已过期，请重新登录",
  FORBIDDEN: "你没有权限执行这个操作",
  NOT_FOUND: "内容不存在或已被删除",
};

function messageFor(error: ActionError): string {
  // 输入错误和冲突的具体原因由服务端给出
  return error.code === "INVALID_INPUT" || error.code === "CONFLICT"
    ? error.message
    : MESSAGES[error.code];
}

type State<T> =
  { status: "idle" } | { status: "success"; data: T } | { status: "error"; error: ActionError };

/**
 * 调用 Server Action：把 `{ ok, data | error }` 转换成界面状态，并按错误码统一弹出提示。
 */
export function useServerAction<I, T>(
  action: (input: I) => Promise<ActionResult<T>>,
  options: { onSuccess?: (data: T) => void } = {},
) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<State<T>>({ status: "idle" });

  function execute(input: I) {
    startTransition(async () => {
      const result = await action(input);
      if (result.ok) {
        setState({ status: "success", data: result.data });
        options.onSuccess?.(result.data);
      } else {
        setState({ status: "error", error: result.error });
        toast.error(messageFor(result.error));
      }
    });
  }

  return { execute, pending, state };
}
