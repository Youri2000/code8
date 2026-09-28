import boundaries from "eslint-plugin-boundaries";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

/**
 * 分层与依赖方向（PRD「前端架构」、ADR-0008、ADR-0011）：
 *
 *   app（路由层）→ features → engines → lib
 *                      ↘ components/ui ↗
 *   features/app → server（业务用例层 + 数据访问层）→ lib、env
 *
 * - 一个 feature 只能通过另一个 feature 的 index.ts 引用它；engine 同理。
 * - components/ui 和 lib 不能反过来依赖任何业务代码。
 * - server 下的文件都 import "server-only"，被客户端组件引用时构建直接失败。
 */
const architecture = {
  files: ["src/**/*.{ts,tsx}"],
  plugins: { boundaries },
  settings: {
    "import/resolver": { typescript: { alwaysTryTypes: true } },
    "boundaries/elements": [
      { type: "app", pattern: "src/app" },
      { type: "feature", pattern: "src/features/*", capture: ["feature"] },
      { type: "engine", pattern: "src/engines/*", capture: ["engine"] },
      { type: "ui", pattern: "src/components/ui" },
      { type: "lib", pattern: "src/lib" },
      { type: "server", pattern: "src/server" },
    ],
    "boundaries/files": [
      { category: "env", pattern: "src/env.ts" },
      { category: "instrumentation", pattern: "src/instrumentation{,.node}.ts" },
    ],
  },
  rules: {
    "boundaries/dependencies": [
      "error",
      {
        default: "disallow",
        policies: [
          // 第三方包和 Node 内置模块不受分层约束
          { allow: { to: { module: { origin: ["external", "core"] } } } },
          // 同一个元素内部可以自由引用
          { allow: { dependency: { relationship: { to: "internal" } } } },
          {
            from: { element: { type: "app" } },
            allow: { to: { element: { types: { anyOf: ["ui", "lib", "server"] } } } },
          },
          {
            from: { element: { types: { anyOf: ["app", "feature"] } } },
            allow: {
              to: {
                element: {
                  types: { anyOf: ["feature", "engine"] },
                  fileInternalPath: "index.ts",
                },
              },
            },
          },
          {
            from: { element: { type: "feature" } },
            allow: { to: { element: { types: { anyOf: ["ui", "lib", "server"] } } } },
          },
          {
            from: { element: { types: { anyOf: ["engine", "ui"] } } },
            allow: { to: { element: { type: "lib" } } },
          },
          {
            from: { element: { type: "server" } },
            allow: { to: { element: { type: "lib" } } },
          },
          // 只有服务端代码和启动钩子可以读取环境变量
          {
            from: [
              { element: { types: { anyOf: ["app", "server"] } } },
              { file: { categories: "instrumentation" } },
            ],
            allow: { to: { file: { categories: "env" } } },
          },
          // 启动钩子把 Node 专用逻辑拆在 instrumentation.node.ts
          {
            from: { file: { categories: "instrumentation" } },
            allow: { to: { file: { categories: "instrumentation" } } },
          },
        ],
      },
    ],
  },
};

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{ts,tsx,mts}"],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
  },
  architecture,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "drizzle/**"]),
]);
