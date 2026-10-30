import { defaultConfig, defineConfig } from "@fern-api/configs/vitest/base.mjs";

export default defineConfig({
    ...defaultConfig,
    test: {
        ...defaultConfig.test,
        exclude: [...(defaultConfig.test.exclude ?? []), "**/__e2e__/**"]
    }
});
