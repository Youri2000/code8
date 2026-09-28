import "server-only";

import { db } from "@/server/db/client";
import { getSessionUser } from "@/server/context";

import { createActionClient } from "./create-action-client";

export type { AuthedContext, WorkspaceContext } from "./create-action-client";

// 各 feature 的 actions.ts 定义 Server Action 的唯一入口
export const action = createActionClient({
  db,
  getUserId: async () => (await getSessionUser())?.id ?? null,
});
