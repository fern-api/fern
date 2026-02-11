import { mergeConfig, defaultConfig, defineConfig } from "@fern-api/configs/vitest/base.mjs";

// biome-ignore lint/suspicious/noExplicitAny: vitest mergeConfig returns Record<string, any>
const config: Record<string, any> = mergeConfig(defaultConfig, defineConfig({
    test: {
        env: {
            NODE_ENV: "test"
        }
    }
}));
export default config;
