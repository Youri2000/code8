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

export function SignupForm({ next }: { next: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // 不用 form action：React 会在 action 结束后重置表单，出错时用户得重新填写
  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      // 注册成功后自动登录；工作区由服务端在创建 User 后自动创建
      const { error } = await authClient.signUp.email({
        name: formText(formData, "name").trim(),
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
        <Label htmlFor="name">昵称</Label>
        <Input id="name" name="name" autoComplete="nickname" required maxLength={50} />
      </div>
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
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={128}
          aria-describedby="password-hint"
        />
        <p id="password-hint" className="text-xs text-muted-foreground">
          至少 8 个字符
        </p>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "注册中…" : "注册"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        已有账号？{" "}
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="text-foreground underline"
        >
          登录
        </Link>
      </p>
    </form>
  );
}
