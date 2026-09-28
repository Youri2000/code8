import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">页面不存在</h1>
      <p className="text-muted-foreground">链接可能有误，或者你没有访问这个工作区的权限。</p>
      <Link href="/w" className={buttonVariants({ variant: "outline" })}>
        回到我的工作区
      </Link>
    </main>
  );
}
