import type { Metadata } from "next";

import { requireMembership } from "@/server/context";

export async function generateMetadata({
  params,
}: PageProps<"/w/[workspaceSlug]">): Promise<Metadata> {
  const { workspace } = await requireMembership((await params).workspaceSlug);
  return { title: workspace.name };
}

export default async function WorkspaceHomePage({ params }: PageProps<"/w/[workspaceSlug]">) {
  const { workspace } = await requireMembership((await params).workspaceSlug);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-6 py-10">
      <h1 className="text-2xl font-semibold">{workspace.name}</h1>
      <p className="text-muted-foreground">
        这里还没有内容。上传数据集、开始分析会话的功能即将上线。
      </p>
    </main>
  );
}
