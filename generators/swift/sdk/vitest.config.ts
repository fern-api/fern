import { resolve } from "node:path";

import { defaultConfig, defineConfig, mergeConfig } from "@fern-api/configs/vitest/base.mjs";

export default mergeConfig(
    defineConfig(defaultConfig),
    defineConfig({
        test: {
            globalSetup: [
                resolve(__dirname, "src/generators/client/util/__test__/generate-endpoint-fixtures.globalSetup.ts")
            ]
        }
    })
);
