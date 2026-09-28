import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignupForm } from "@/features/auth";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { getSessionUser } from "@/server/context";

export const metadata: Metadata = { title: "注册" };

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { next } = await searchParams;
  const target = safeRedirectPath(typeof next === "string" ? next : null);
  if (await getSessionUser()) redirect(target);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>注册问数</h1>
        </CardTitle>
        <CardDescription>注册后会自动为你创建一个工作区。</CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm next={target} />
      </CardContent>
    </Card>
  );
}
