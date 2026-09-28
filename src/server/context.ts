import "server-only";

import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/server/auth";
import { db } from "@/server/db/client";
import { getMembership } from "@/server/services/workspaces";

/** 当前请求的登录用户（同一请求内只查询一次）。 */
export const getSessionUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
});

/** 未登录时跳到登录页，登录后回到 returnTo。proxy 只做了乐观检查，这里才是真正的校验。 */
export async function requireUser(returnTo: string) {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return user;
}

/** 当前 User 在该工作区的身份；不是成员时返回 404，不泄露工作区是否存在。 */
export const requireMembership = cache(async (slug: string) => {
  const user = await requireUser(`/w/${slug}`);
  const membership = await getMembership(db, { userId: user.id, slug });
  if (!membership) notFound();
  return { user, ...membership };
});
