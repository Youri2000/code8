import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";

import "./globals.css";

// 英文和数字用自托管的 Inter（不依赖 Google Fonts，国内可访问）；中文回退到系统字体栈，见 globals.css。
const inter = localFont({
  src: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "问数 WenShu", template: "%s · 问数" },
  description: "用中文向表格数据提问，AI 生成图表，整理成可以协作、可以安全分享的看板。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
