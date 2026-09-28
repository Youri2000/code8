import { BarChart3, LayoutDashboard, MessageSquareText, Share2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";

const features = [
  {
    icon: MessageSquareText,
    title: "用中文提问",
    body: "上传 CSV 或 Excel，直接问“上个月哪个省份增长最快”。查询在你的浏览器里执行，原始数据不离开本地。",
  },
  {
    icon: LayoutDashboard,
    title: "整理成看板",
    body: "把满意的图表固定到看板，拖拽排版，和团队成员按角色协作。",
  },
  {
    icon: Share2,
    title: "安全地分享",
    body: "一个链接发给客户：只看得到图表，看不到原始数据和对话，随时可以撤销。",
  },
];

export default function Home() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-6">
      <header className="flex h-16 items-center justify-between">
        <span className="flex items-center gap-2 font-semibold">
          <BarChart3 className="size-5" aria-hidden />
          问数
        </span>
        <a
          href="https://github.com/Youri2000/code8"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          GitHub
        </a>
      </header>

      <main className="flex flex-1 flex-col justify-center gap-12 py-16">
        <section className="flex max-w-2xl flex-col gap-6">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            用一句中文，问出数据里的答案
          </h1>
          <p className="text-lg text-muted-foreground">
            问数是面向团队的对话式数据分析工具：上传表格、提出问题，AI
            生成图表，再整理成可以协作、可以安全分享的看板。
          </p>
          <div>
            <Button size="lg" disabled>
              一键体验 · 即将上线
            </Button>
          </div>
        </section>

        <ul className="grid gap-6 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex flex-col gap-2 rounded-xl border p-5">
              <Icon className="size-5 text-muted-foreground" aria-hidden />
              <h2 className="font-medium">{title}</h2>
              <p className="text-sm text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
