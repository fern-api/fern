import { defaultConfig, defineConfig, mergeConfig } from "@fern-api/configs/vitest/base.mjs";

export default mergeConfig(
    defineConfig(defaultConfig),
    defineConfig({
        test: {
            exclude: ["**/*.integration.test.ts", "**/node_modules/**"]
        }
    })
);
