/**
 * 权限矩阵（PRD「身份认证与授权」）。服务端据此授权；客户端只用它隐藏或禁用按钮。
 */
export const ROLES = ["owner", "editor", "viewer"] as const;
export type Role = (typeof ROLES)[number];

/** 只看 Role 就能决定的操作。 */
const ROLE_PERMISSIONS = {
  /** 查看数据集、会话、看板 */
  "workspace.view": ["owner", "editor", "viewer"],
  /** 管理成员、邀请、修改角色、删除工作区、转交 Owner */
  "workspace.manage": ["owner"],
  /** 上传数据集、编辑列说明 */
  "dataset.upload": ["owner", "editor"],
  /** 新建会话、Fork 会话 */
  "conversation.create": ["owner", "editor"],
  /** 新建看板、Pin、编辑看板 */
  "board.edit": ["owner", "editor"],
  /** 创建、撤销分享链接 */
  "shareLink.manage": ["owner", "editor"],
} as const satisfies Record<string, readonly Role[]>;

export type RolePermission = keyof typeof ROLE_PERMISSIONS;

/** 还要看资源创建者才能决定的操作。 */
export type OwnedPermission =
  "dataset.delete" | "conversation.ask" | "conversation.delete" | "board.delete";

export type Permission = RolePermission | OwnedPermission;

export interface Actor {
  userId: string;
  role: Role;
}

export interface OwnedResource {
  createdBy: string;
}

export function can(actor: Actor, permission: RolePermission): boolean;
export function can(actor: Actor, permission: OwnedPermission, resource: OwnedResource): boolean;
export function can(actor: Actor, permission: Permission, resource?: OwnedResource): boolean {
  if (permission in ROLE_PERMISSIONS) {
    const allowed: readonly Role[] = ROLE_PERMISSIONS[permission as RolePermission];
    return allowed.includes(actor.role);
  }
  const isCreator = resource?.createdBy === actor.userId;
  switch (permission as OwnedPermission) {
    case "conversation.ask":
      // 即使是 Owner，也只能在自己创建的会话里继续追问
      return actor.role !== "viewer" && isCreator;
    case "dataset.delete":
    case "conversation.delete":
    case "board.delete":
      return actor.role === "owner" || (actor.role === "editor" && isCreator);
  }
}
