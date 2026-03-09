import { defineConfig, mergeConfig } from "vitest/config";

import baseConfig from "@slap/config/vitest/base";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: [
        "src/**/*.test.ts",
        "src/**/*.spec.ts",
        "src/**/*.test.tsx",
        "src/**/*.spec.tsx",
      ],
    },
  }),
);
