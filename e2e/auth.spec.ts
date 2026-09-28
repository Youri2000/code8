import { expect, test, uniqueEmail } from "./fixtures";

test("sign up, sign out, and sign back in to the page I was on", async ({
  page,
  expectAccessible,
}) => {
  const email = uniqueEmail();
  const password = "correct-horse-battery";

  // 注册：自动进入以昵称命名的工作区
  await page.goto("/signup");
  await expectAccessible();
  await page.getByLabel("昵称").fill("端到端");
  await page.getByLabel("邮箱").fill(email);
  await page.getByLabel("密码").fill(password);
  await page.getByRole("button", { name: "注册" }).click();

  await expect(page).toHaveURL(/\/w\/[a-z0-9]{10}$/);
  await expect(page.getByRole("heading", { name: "端到端 的工作区" })).toBeVisible();
  await expectAccessible();
  const workspaceUrl = new URL(page.url()).pathname;

  // 退出登录
  await page.getByRole("button", { name: "退出登录" }).click();
  await expect(page).toHaveURL(/\/login$/);

  // 未登录访问工作区：被带到登录页，并记住原来的页面
  await page.goto(workspaceUrl);
  await expect(page).toHaveURL(`/login?next=${encodeURIComponent(workspaceUrl)}`);
  await expectAccessible();

  await page.getByLabel("邮箱").fill(email);
  await page.getByLabel("密码").fill("wrong-password");
  await page.getByRole("button", { name: "登录" }).click();
  // Next.js 的路由播报器也是 role="alert"，因此限定在表单内查找
  await expect(page.locator("form").getByRole("alert")).toHaveText("邮箱或密码不正确");
  // 输错密码后不需要重新输入邮箱
  await expect(page.getByLabel("邮箱")).toHaveValue(email);

  await page.getByLabel("密码").fill(password);
  await page.getByRole("button", { name: "登录" }).click();
  await expect(page).toHaveURL(workspaceUrl);
  await expect(page.getByRole("heading", { name: "端到端 的工作区" })).toBeVisible();
});

test("a workspace I am not a member of looks like it does not exist", async ({ page }) => {
  await page.goto("/signup");
  await page.getByLabel("昵称").fill("外人");
  await page.getByLabel("邮箱").fill(uniqueEmail());
  await page.getByLabel("密码").fill("correct-horse-battery");
  await page.getByRole("button", { name: "注册" }).click();
  await expect(page).toHaveURL(/\/w\/[a-z0-9]{10}$/);

  const response = await page.goto("/w/zzzzzzzzzz");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "页面不存在" })).toBeVisible();
});
