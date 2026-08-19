import { defaultConfig, defineConfig, mergeConfig } from "@fern-api/configs/vitest/base.mjs";

export default mergeConfig(
    defineConfig(defaultConfig),
    defineConfig({
        plugins: [
            {
                name: "suppress-sourcemap-warnings",
                configResolved(config) {
                    const originalWarnOnce = config.logger.warnOnce.bind(config.logger);
                    config.logger.warnOnce = (msg, options) => {
                        if (typeof msg === "string" && msg.includes("points to missing source files")) {
                            return;
                        }
                        originalWarnOnce(msg, options);
                    };
                }
            }
        ],
        test: {
            exclude: ["**/*.integration.test.ts", "**/node_modules/**"],
            server: {
                deps: {
                    // @fern-api/ui-core-utils dist/index.js uses extensionless ESM imports
                    // (e.g. "./addPrefixToString" instead of "./addPrefixToString.js"), which
                    // breaks under Node's strict ESM resolution. Inlining the package lets
                    // Vite's bundler resolve those imports correctly.
                    inline: ["@fern-api/ui-core-utils"]
                }
            }
        }
    })
);
