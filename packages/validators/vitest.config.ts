import baseConfig from "@slap/config/vitest/base";
import { defineConfig, mergeConfig } from "vitest/config";

export default mergeConfig(baseConfig, defineConfig({}));
