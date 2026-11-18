import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["node_modules/**", "allure-results/**", "apps/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.mjs"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["**/*.ts"],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // node:test's test()/describe() return promises the runner awaits itself.
      "@typescript-eslint/no-floating-promises": [
        "error",
        {
          allowForKnownSafeCalls: [
            {
              from: "package",
              name: ["test", "describe", "it", "suite"],
              package: "node:test",
            },
          ],
        },
      ],
    },
  },
);
