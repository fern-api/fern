import { defaultConfig, defineConfig, mergeConfig } from "@fern-api/configs/vitest/base.mjs";

// biome-ignore lint/suspicious/noExplicitAny: vitest mergeConfig returns Record<string, any>
const config: Record<string, any> = mergeConfig(
    defaultConfig,
    defineConfig({
        test: {
            env: {
                FERN_STACK_TRACK: "1"
            }
        }
    })
);
export default config;
