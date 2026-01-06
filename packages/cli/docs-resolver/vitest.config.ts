import { defaultConfig, defineConfig, mergeConfig } from "@fern-api/configs/vitest/base.mjs";

export default mergeConfig(
    defaultConfig,
    defineConfig({
        test: {
            server: {
                deps: {
                    inline: ["@fern-api/ui-core-utils"]
                }
            }
        }
    })
);
