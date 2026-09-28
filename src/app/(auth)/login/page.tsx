import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/features/auth";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { getSessionUser } from "@/server/context";

export const metadata: Metadata = { title: "登录" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const target = safeRedirectPath(typeof next === "string" ? next : null);
  if (await getSessionUser()) redirect(target);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>登录问数</h1>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <LoginForm next={target} />
      </CardContent>
    </Card>
  );
}
