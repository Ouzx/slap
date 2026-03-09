import { defineConfig, mergeConfig } from "vitest/config";

import baseConfig from "@slap/config/vitest/base";

export default mergeConfig(baseConfig, defineConfig({}));
