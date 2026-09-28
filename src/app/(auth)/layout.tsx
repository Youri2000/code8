import { BarChart3 } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 py-12">
      <header>
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BarChart3 className="size-5" aria-hidden />
          问数
        </Link>
      </header>
      <main className="w-full max-w-sm">{children}</main>
    </div>
  );
}
