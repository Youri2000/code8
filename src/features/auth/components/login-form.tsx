"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formText } from "@/lib/form-data";

import { authClient } from "../auth-client";
import { authErrorMessage } from "../error-messages";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // 不用 form action：React 会在 action 结束后重置表单，输错密码时用户得重新输入邮箱
  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const { error } = await authClient.signIn.email({
        email: formText(formData, "email"),
        password: formText(formData, "password"),
      });
      if (error) {
        setError(authErrorMessage(error));
        return;
      }
      router.replace(next);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">邮箱</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">密码</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "登录中…" : "登录"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        还没有账号？{" "}
        <Link
          href={`/signup?next=${encodeURIComponent(next)}`}
          className="text-foreground underline"
        >
          注册
        </Link>
      </p>
    </form>
  );
}
