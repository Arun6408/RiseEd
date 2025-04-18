import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Disables 'any' rule
      "@typescript-eslint/no-unused-vars": "off", // Disables unused variables rule
      "@typescript-eslint/ban-ts-comment": "off", // Disables restriction on @ts-ignore
      "@typescript-eslint/no-unsafe-function-type": "off", // Disables the rule for unsafe function types
    },
  },
];

export default eslintConfig;
