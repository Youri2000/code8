import { redirect } from "next/navigation";

import { requireUser } from "@/server/context";
import { db } from "@/server/db/client";
import { ensureHomeWorkspace } from "@/server/services/workspaces";

/** 登录后的落地入口：跳到 User 的工作区（没有时补建一个）。 */
export default async function WorkspaceEntryPage() {
  const user = await requireUser("/w");
  const workspace = await ensureHomeWorkspace(db, user);
  redirect(`/w/${workspace.slug}`);
}
