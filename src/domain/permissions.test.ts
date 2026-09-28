import { describe, expect, it } from "vitest";

import { can, type OwnedPermission, type Role, type RolePermission } from "./permissions";

const me = "user-me";
const other = "user-other";
const actor = (role: Role) => ({ userId: me, role });

// 与 PRD 权限矩阵逐行对应：[操作, Owner, Editor, Viewer]
const roleMatrix: [RolePermission, boolean, boolean, boolean][] = [
  ["workspace.view", true, true, true],
  ["dataset.upload", true, true, false],
  ["conversation.create", true, true, false],
  ["board.edit", true, true, false],
  ["shareLink.manage", true, true, false],
  ["workspace.manage", true, false, false],
];

// [操作, 是否为创建者, Owner, Editor, Viewer]
const ownedMatrix: [OwnedPermission, boolean, boolean, boolean, boolean][] = [
  ["dataset.delete", true, true, true, false],
  ["dataset.delete", false, true, false, false],
  ["conversation.ask", true, true, true, false],
  ["conversation.ask", false, false, false, false],
  ["conversation.delete", true, true, true, false],
  ["conversation.delete", false, true, false, false],
  ["board.delete", true, true, true, false],
  ["board.delete", false, true, false, false],
];

describe("can", () => {
  describe.each(roleMatrix)("%s", (permission, owner, editor, viewer) => {
    it.each([
      ["owner", owner],
      ["editor", editor],
      ["viewer", viewer],
    ] as const)("%s → %s", (role, expected) => {
      expect(can(actor(role), permission)).toBe(expected);
    });
  });

  describe.each(ownedMatrix)("%s (creator: %s)", (permission, isCreator, owner, editor, viewer) => {
    const resource = { createdBy: isCreator ? me : other };
    it.each([
      ["owner", owner],
      ["editor", editor],
      ["viewer", viewer],
    ] as const)("%s → %s", (role, expected) => {
      expect(can(actor(role), permission, resource)).toBe(expected);
    });
  });
});
