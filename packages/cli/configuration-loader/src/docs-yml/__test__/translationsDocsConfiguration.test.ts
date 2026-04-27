import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { parseDocsConfiguration } from "../parseDocsConfiguration.js";

function makeMinimalRawConfig(
    overrides: Partial<docsYml.RawSchemas.DocsConfiguration> = {}
): docsYml.RawSchemas.DocsConfiguration {
    return {
        instances: [],
        // navigation is required by parseDocsConfiguration
        navigation: [],
        ...overrides
    } as unknown as docsYml.RawSchemas.DocsConfiguration;
}

describe("parseDocsConfiguration — translations config field", () => {
    it("should produce undefined translations when not specified", async () => {
        // No real FS access needed — no translation dirs to check
        const FAKE_FERN_DIR = "/fern" as AbsoluteFilePath;
        const FAKE_CONFIG_PATH = "/fern/docs.yml" as AbsoluteFilePath;

        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration: makeMinimalRawConfig(),
            absolutePathToFernFolder: FAKE_FERN_DIR,
            absoluteFilepathToDocsConfig: FAKE_CONFIG_PATH,
            context: createMockTaskContext()
        });

        expect(parsed.translations).toBeUndefined();
        expect(parsed.translationPages).toBeUndefined();
    });
});

describe("parseDocsConfiguration — translation pages loading", () => {
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), "fern-translations-test-"));
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    it("should return undefined translationPages when no translations configured", async () => {
        const fernDir = tmpDir as AbsoluteFilePath;
        const configPath = path.join(tmpDir, "docs.yml") as AbsoluteFilePath;
        await writeFile(configPath, "");

        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration: makeMinimalRawConfig(),
            absolutePathToFernFolder: fernDir,
            absoluteFilepathToDocsConfig: configPath,
            context: createMockTaskContext()
        });

        expect(parsed.translationPages).toBeUndefined();
    });

    it("should load translated pages from translations/<lang>/ directories", async () => {
        const fernDir = tmpDir as AbsoluteFilePath;
        const configPath = path.join(tmpDir, "docs.yml") as AbsoluteFilePath;

        // Create a page in the fern folder
        const pagesDir = path.join(tmpDir, "pages");
        await mkdir(pagesDir, { recursive: true });
        await writeFile(path.join(pagesDir, "getting-started.mdx"), "# Getting Started");
        await writeFile(configPath, "");

        // Create French translation directory and the same page
        const frDir = path.join(tmpDir, "translations", "fr", "pages");
        await mkdir(frDir, { recursive: true });
        await writeFile(path.join(frDir, "getting-started.mdx"), "# Démarrage rapide");

        // Build a raw config that references the page
        // Note: Must include a default locale (en) so that "fr" is treated as a translation
        const config = makeMinimalRawConfig({
            translations: [{ lang: "en", default: true }, { lang: "fr" }],
            navigation: [
                {
                    page: "Getting Started",
                    path: "pages/getting-started.mdx"
                }
            ] as docsYml.RawSchemas.NavigationConfig
        });

        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration: config,
            absolutePathToFernFolder: fernDir,
            absoluteFilepathToDocsConfig: configPath,
            context: createMockTaskContext()
        });

        expect(parsed.translationPages).toBeDefined();
        const frPages = parsed.translationPages?.["fr"];
        expect(frPages).toBeDefined();
        expect(frPages?.[RelativeFilePath.of("pages/getting-started.mdx")]).toBe("# Démarrage rapide");
    });

    it("should warn about missing translation files but still succeed", async () => {
        const fernDir = tmpDir as AbsoluteFilePath;
        const configPath = path.join(tmpDir, "docs.yml") as AbsoluteFilePath;

        // Create a page in the fern folder
        const pagesDir = path.join(tmpDir, "pages");
        await mkdir(pagesDir, { recursive: true });
        await writeFile(path.join(pagesDir, "getting-started.mdx"), "# Getting Started");
        await writeFile(configPath, "");

        // Create Japanese translation directory but WITHOUT the page
        const jaDir = path.join(tmpDir, "translations", "ja");
        await mkdir(jaDir, { recursive: true });

        // Note: Must include a default locale (en) so that "ja" is treated as a translation
        const config = makeMinimalRawConfig({
            translations: [{ lang: "en", default: true }, { lang: "ja" }],
            navigation: [
                {
                    page: "Getting Started",
                    path: "pages/getting-started.mdx"
                }
            ] as docsYml.RawSchemas.NavigationConfig
        });

        const warnings: string[] = [];
        const mockContext = createMockTaskContext({
            logger: {
                warn: (msg: string) => warnings.push(msg),
                info: () => undefined,
                debug: () => undefined,
                error: () => undefined
            } as never
        });

        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration: config,
            absolutePathToFernFolder: fernDir,
            absoluteFilepathToDocsConfig: configPath,
            context: mockContext
        });

        // Should still have an entry for "ja" but empty (no files found)
        expect(parsed.translationPages?.["ja"]).toBeDefined();
        expect(Object.keys(parsed.translationPages?.["ja"] ?? {})).toHaveLength(0);
        // Should have warned about missing files
        expect(warnings.some((w) => w.includes("ja") && w.includes("missing"))).toBe(true);
    });

    it("should load translations for multiple locales", async () => {
        const fernDir = tmpDir as AbsoluteFilePath;
        const configPath = path.join(tmpDir, "docs.yml") as AbsoluteFilePath;

        const pagesDir = path.join(tmpDir, "pages");
        await mkdir(pagesDir, { recursive: true });
        await writeFile(path.join(pagesDir, "index.mdx"), "# Home");
        await writeFile(configPath, "");

        for (const [locale, content] of [
            ["fr", "# Accueil"],
            ["ja", "# ホーム"]
        ] as const) {
            const dir = path.join(tmpDir, "translations", locale, "pages");
            await mkdir(dir, { recursive: true });
            await writeFile(path.join(dir, "index.mdx"), content);
        }

        // Note: Must include a default locale (en) so that "fr" and "ja" are treated as translations
        const config = makeMinimalRawConfig({
            translations: [{ lang: "en", default: true }, { lang: "fr" }, { lang: "ja" }],
            navigation: [{ page: "Home", path: "pages/index.mdx" }] as docsYml.RawSchemas.NavigationConfig
        });

        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration: config,
            absolutePathToFernFolder: fernDir,
            absoluteFilepathToDocsConfig: configPath,
            context: createMockTaskContext()
        });

        expect(parsed.translationPages?.["fr"]?.[RelativeFilePath.of("pages/index.mdx")]).toBe("# Accueil");
        expect(parsed.translationPages?.["ja"]?.[RelativeFilePath.of("pages/index.mdx")]).toBe("# ホーム");
    });
});
