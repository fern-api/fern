import { defaultConfig, defineConfig, mergeConfig } from "@fern-api/configs/vitest/base.mjs";

export default mergeConfig(
    defaultConfig,
    defineConfig({
        test: {
            env: {
                FERN_STACK_TRACK: "1"
            }
        }
    })
);
