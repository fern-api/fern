import { defaultConfig, defineConfig, mergeConfig } from "@fern-api/configs/vitest/base.mjs";

export default mergeConfig(
    defineConfig(defaultConfig),
    defineConfig({
        test: {
            globalSetup: ["./globalSetup.ts"],
            setupFiles: ["./src/workerSetup.ts"],
            isolate: false,
            forceRerunTriggers: ["../../../../test-definitions/fern/apis/**"]
        }
    })
);
