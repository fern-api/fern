import { defaultConfig, defineConfig, mergeConfig } from "@fern-api/configs/vitest/base.mjs";

export default mergeConfig(
    defineConfig(defaultConfig),
    defineConfig({
        test: {
            setupFiles: ["./src/workerSetup.ts"],
            isolate: false
        }
    })
);
