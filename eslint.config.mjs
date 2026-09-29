import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
  ]),
  {
    files: ["src/components/**/*.{ts,tsx}", "src/hooks/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-globals": [
        "error",
        {
          name: "localStorage",
          message: "Do not access localStorage directly in components or hooks. Use TodoService instead.",
        },
        {
          name: "sessionStorage",
          message: "Do not access sessionStorage directly in components or hooks. Use TodoService instead.",
        },
        {
          name: "fetch",
          message: "Do not access fetch directly in components or hooks. Use TodoService instead.",
        },
      ],
    },
  },
]);

export default eslintConfig;
