import { defaultConfig, defineConfig, mergeConfig } from "@fern-api/configs/vitest/base.mjs";

export default mergeConfig(
    defaultConfig,
    defineConfig({
        test: {
            server: {
                deps: {
                    // @fern-api/ui-core-utils (pulled in via @fern-api/docs-resolver → fdr-sdk)
                    // ships extensionless ESM imports that Node can't resolve without bundling
                    inline: ["@fern-api/ui-core-utils"]
                }
            }
        }
    })
);
