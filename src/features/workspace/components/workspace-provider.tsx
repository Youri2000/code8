"use client";

import { createContext, useContext } from "react";

import {
  can,
  type OwnedPermission,
  type OwnedResource,
  type Role,
  type RolePermission,
} from "@/domain/permissions";

export interface WorkspaceContextValue {
  workspace: { id: string; name: string; slug: string };
  member: { id: string; userId: string; role: Role };
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

/**
 * 只存工作区、成员和角色这类很少变化的身份信息，不放业务数据（PRD「前端架构」）。
 */
export function WorkspaceProvider({
  value,
  children,
}: {
  value: WorkspaceContextValue;
  children: React.ReactNode;
}) {
  return <WorkspaceContext value={value}>{children}</WorkspaceContext>;
}

export function useWorkspace(): WorkspaceContextValue {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("useWorkspace must be used inside <WorkspaceProvider>");
  return value;
}

/**
 * 当前成员能否执行某个操作。只用于隐藏或禁用按钮，真正的授权永远在服务端。
 */
export function useCan() {
  const { member } = useWorkspace();
  const actor = { userId: member.userId, role: member.role };

  function check(permission: RolePermission): boolean;
  function check(permission: OwnedPermission, resource: OwnedResource): boolean;
  function check(permission: RolePermission | OwnedPermission, resource?: OwnedResource) {
    return resource
      ? can(actor, permission as OwnedPermission, resource)
      : can(actor, permission as RolePermission);
  }
  return check;
}
