import AxeBuilder from "@axe-core/playwright";
import { test as base, expect } from "@playwright/test";

/** 每个页面的可访问性检查：出现任何 axe 违规即失败。 */
export const test = base.extend<{ expectAccessible: () => Promise<void> }>({
  expectAccessible: async ({ page }, use) => {
    await use(async () => {
      const { violations } = await new AxeBuilder({ page }).analyze();
      expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
    });
  },
});

export { expect };

export function uniqueEmail(): string {
  return `e2e-${crypto.randomUUID()}@wenshu.test`;
}
