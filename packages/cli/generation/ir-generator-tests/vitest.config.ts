import { defaultConfig, defineConfig, mergeConfig } from "@fern-api/configs/vitest/base.mjs";

export default mergeConfig(
    defineConfig(defaultConfig),
    defineConfig({
        test: {
            globalSetup: ["./globalSetup.ts"],
            forceRerunTriggers: [
                "../../../../test-definitions/fern/apis/**",
                "../../../../test-definitions-openapi/fern/apis/**"
            ]
        }
    })
);
