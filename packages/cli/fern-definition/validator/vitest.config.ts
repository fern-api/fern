import { defaultConfig, defineConfig, mergeConfig } from "@fern-api/configs/vitest/base.mjs";

export default mergeConfig(
    defineConfig(defaultConfig),
    defineConfig({
        test: {
            setupFiles: ["./src/workerSetup.ts"],
            isolate: false,
            // Workspace-loading rule tests can occasionally exceed the default 5s
            // timeout on slower CI runners; bump to 30s for headroom.
            testTimeout: 30_000
        }
    })
);
