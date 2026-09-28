import { BarChart3 } from "lucide-react";
import Link from "next/link";

import { SignOutButton } from "@/features/auth";
import { WorkspaceProvider } from "@/features/workspace";
import { requireMembership } from "@/server/context";

export default async function WorkspaceLayout({
  children,
  params,
}: LayoutProps<"/w/[workspaceSlug]">) {
  const { workspaceSlug } = await params;
  const { user, workspace, member } = await requireMembership(workspaceSlug);

  return (
    <WorkspaceProvider
      value={{
        workspace: { id: workspace.id, name: workspace.name, slug: workspace.slug },
        member: { id: member.id, userId: member.userId, role: member.role },
      }}
    >
      <div className="flex min-h-dvh flex-col">
        <header className="flex h-14 items-center justify-between border-b px-6">
          <Link href={`/w/${workspace.slug}`} className="flex items-center gap-2 font-semibold">
            <BarChart3 className="size-5" aria-hidden />
            {workspace.name}
          </Link>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{user.email}</span>
            <SignOutButton />
          </div>
        </header>
        {children}
      </div>
    </WorkspaceProvider>
  );
}
