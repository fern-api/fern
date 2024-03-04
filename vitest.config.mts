import { defineConfig } from "vitest/config";
import defaultConfig from "./shared/vitest.config.mjs";

export default defineConfig({
    ...defaultConfig,
    test: {
        ...defaultConfig.test,
        exclude: ["**/ir-generator/**", "**/yaml-migrations/**"]
    }
});
