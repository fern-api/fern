import { defaultConfig, defineConfig, mergeConfig } from "@fern-api/configs/vitest/base.mjs";

export default mergeConfig(
    defineConfig(defaultConfig),
    defineConfig({
        test: {
            server: {
                deps: {
                    // @fern-api/ui-core-utils dist/index.js uses extensionless ESM imports
                    // (e.g. "./addPrefixToString" instead of "./addPrefixToString.js"), which
                    // breaks under Node's strict ESM resolution. Inlining the package lets
                    // Vite's bundler resolve those imports correctly.
                    inline: ["@fern-api/ui-core-utils", "@fern-api/docs-parsers"]
                }
            }
        }
    })
);
