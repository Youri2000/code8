import { describe, expect, it } from "vitest";

import { safeRedirectPath } from "./safe-redirect";

describe("safeRedirectPath", () => {
  it.each([
    ["/w/abc", "/w/abc"],
    ["/w/abc?tab=boards", "/w/abc?tab=boards"],
  ])("keeps the in-site path %s", (next, expected) => {
    expect(safeRedirectPath(next)).toBe(expected);
  });

  it.each([
    [null],
    [undefined],
    [""],
    ["https://evil.com"],
    ["//evil.com/w"],
    ["/\\evil.com"],
    ["javascript:alert(1)"],
  ])("falls back for %s", (next) => {
    expect(safeRedirectPath(next)).toBe("/w");
  });
});
