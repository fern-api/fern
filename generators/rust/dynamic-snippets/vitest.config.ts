import { mergeConfig, defaultConfig, defineConfig } from "@fern-api/configs/vitest/base.mjs";

export default mergeConfig(defaultConfig, defineConfig({
    test: {
        env: {
            NODE_ENV: "test"
        }
    }
}));