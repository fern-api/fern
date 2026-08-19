import { defaultConfig, defineConfig } from "@fern-api/configs/vitest/base.mjs";

// `src/__test__` also holds heavier integration tests that currently fail to load
// their API workspace fixtures in this environment, so we can't run the whole
// directory (the shared base config's `**/*.{test,spec}.ts` glob would pick them
// up). Until those are fixed, run the util tests plus the (pure) docs translation
// unit tests explicitly. Add new pure unit tests here as they are written.
const include = [
    "src/utils/__test__/**/*.test.ts",
    "src/__test__/applyTranslatedApiTitlesToNavTree.test.ts",
    "src/__test__/applyTranslatedFrontmatterToNavTree.test.ts",
    "src/__test__/applyTranslatedNavigationOverlays.test.ts",
    "src/__test__/translations-config.test.ts",
    "src/__test__/sidebar-title.test.ts",
    "src/__test__/product-landing-page.test.ts",
    "src/__test__/versioned-root-landing-page.test.ts",
    "src/__test__/library-hardfail.test.ts"
];

export default defineConfig({
    ...defaultConfig,
    test: {
        ...defaultConfig.test,
        include
    }
});
