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

describe("parseDocsConfiguration — translation navigation overlay docs.yml location", () => {
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), "fern-translations-overlay-test-"));
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    it("should read overlay docs.yml directly from translations/<lang>/ without a nested fern folder", async () => {
        const fernDir = tmpDir as AbsoluteFilePath;
        const configPath = path.join(tmpDir, "docs.yml") as AbsoluteFilePath;
        await writeFile(configPath, "");

        // Place the overlay directly under translations/fr — no nested fern/ folder
        const frDir = path.join(tmpDir, "translations", "fr");
        await mkdir(frDir, { recursive: true });
        await writeFile(path.join(frDir, "docs.yml"), "title: Documentation\nannouncement:\n  message: Bienvenue\n");

        const config = makeMinimalRawConfig({
            translations: [{ lang: "en", default: true }, { lang: "fr" }]
        });

        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration: config,
            absolutePathToFernFolder: fernDir,
            absoluteFilepathToDocsConfig: configPath,
            context: createMockTaskContext()
        });

        expect(parsed.translationNavigationOverlays?.["fr"]?.announcement?.message).toBe("Bienvenue");
    });

    it("should fall back to translations/<lang>/fern/docs.yml when the canonical location is missing", async () => {
        const fernDir = tmpDir as AbsoluteFilePath;
        const configPath = path.join(tmpDir, "docs.yml") as AbsoluteFilePath;
        await writeFile(configPath, "");

        // Place the overlay only under the legacy nested fern/ location
        const frFernDir = path.join(tmpDir, "translations", "fr", "fern");
        await mkdir(frFernDir, { recursive: true });
        await writeFile(path.join(frFernDir, "docs.yml"), "title: Documentation\nannouncement:\n  message: Bonjour\n");

        const config = makeMinimalRawConfig({
            translations: [{ lang: "en", default: true }, { lang: "fr" }]
        });

        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration: config,
            absolutePathToFernFolder: fernDir,
            absoluteFilepathToDocsConfig: configPath,
            context: createMockTaskContext()
        });

        expect(parsed.translationNavigationOverlays?.["fr"]?.announcement?.message).toBe("Bonjour");
    });

    it("should prefer translations/<lang>/docs.yml when both locations exist", async () => {
        const fernDir = tmpDir as AbsoluteFilePath;
        const configPath = path.join(tmpDir, "docs.yml") as AbsoluteFilePath;
        await writeFile(configPath, "");

        const frDir = path.join(tmpDir, "translations", "fr");
        const frFernDir = path.join(frDir, "fern");
        await mkdir(frFernDir, { recursive: true });
        await writeFile(path.join(frDir, "docs.yml"), "announcement:\n  message: from-canonical\n");
        await writeFile(path.join(frFernDir, "docs.yml"), "announcement:\n  message: from-legacy\n");

        const config = makeMinimalRawConfig({
            translations: [{ lang: "en", default: true }, { lang: "fr" }]
        });

        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration: config,
            absolutePathToFernFolder: fernDir,
            absoluteFilepathToDocsConfig: configPath,
            context: createMockTaskContext()
        });

        expect(parsed.translationNavigationOverlays?.["fr"]?.announcement?.message).toBe("from-canonical");
    });

    it("should resolve product nav file paths relative to translations/<lang>/", async () => {
        const fernDir = tmpDir as AbsoluteFilePath;
        const configPath = path.join(tmpDir, "docs.yml") as AbsoluteFilePath;
        await writeFile(configPath, "");

        const frDir = path.join(tmpDir, "translations", "fr");
        await mkdir(frDir, { recursive: true });
        await writeFile(
            path.join(frDir, "docs.yml"),
            "products:\n  - display-name: Produit\n    path: ./product.yml\n"
        );
        await writeFile(path.join(frDir, "product.yml"), "tabs:\n  guides:\n    display-name: Guides\n");

        const config = makeMinimalRawConfig({
            translations: [{ lang: "en", default: true }, { lang: "fr" }]
        });

        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration: config,
            absolutePathToFernFolder: fernDir,
            absoluteFilepathToDocsConfig: configPath,
            context: createMockTaskContext()
        });

        const productOverlay = parsed.translationNavigationOverlays?.["fr"]?.products?.[0];
        expect(productOverlay?.displayName).toBe("Produit");
        expect(productOverlay?.tabs?.["guides"]?.displayName).toBe("Guides");
    });

    it("should load tabs and navigation from a top-level version's referenced nav file", async () => {
        const fernDir = tmpDir as AbsoluteFilePath;
        const configPath = path.join(tmpDir, "docs.yml") as AbsoluteFilePath;
        await writeFile(configPath, "");

        const frDir = path.join(tmpDir, "translations", "fr");
        const versionsDir = path.join(frDir, "versions");
        await mkdir(versionsDir, { recursive: true });
        await writeFile(
            path.join(frDir, "docs.yml"),
            ["versions:", "  - display-name: V1", "    slug: v1", "    path: ./versions/v1.yml"].join("\n") + "\n"
        );
        await writeFile(
            path.join(versionsDir, "v1.yml"),
            [
                "tabs:",
                "  api:",
                "    display-name: Référence API",
                "navigation:",
                "  - tab: api",
                "    layout:",
                "      - section: Aperçu"
            ].join("\n") + "\n"
        );

        const config = makeMinimalRawConfig({
            translations: [{ lang: "en", default: true }, { lang: "fr" }]
        });

        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration: config,
            absolutePathToFernFolder: fernDir,
            absoluteFilepathToDocsConfig: configPath,
            context: createMockTaskContext()
        });

        const versionOverlay = parsed.translationNavigationOverlays?.["fr"]?.versions?.[0];
        expect(versionOverlay?.displayName).toBe("V1");
        expect(versionOverlay?.slug).toBe("v1");
        expect(versionOverlay?.tabs?.["api"]?.displayName).toBe("Référence API");
        expect(versionOverlay?.navigation).toBeDefined();
    });

    it("should parse versions nested inside a product and load their nav files", async () => {
        const fernDir = tmpDir as AbsoluteFilePath;
        const configPath = path.join(tmpDir, "docs.yml") as AbsoluteFilePath;
        await writeFile(configPath, "");

        const frDir = path.join(tmpDir, "translations", "fr");
        const versionsDir = path.join(frDir, "versions");
        await mkdir(versionsDir, { recursive: true });
        await writeFile(
            path.join(frDir, "docs.yml"),
            [
                "products:",
                "  - display-name: Plateforme",
                "    versions:",
                "      - display-name: V4",
                "        slug: v4",
                "        path: ./versions/v4.yml",
                "      - display-name: Hérité",
                "        slug: v2"
            ].join("\n") + "\n"
        );
        await writeFile(
            path.join(versionsDir, "v4.yml"),
            ["tabs:", "  docs:", "    display-name: Documentation"].join("\n") + "\n"
        );

        const config = makeMinimalRawConfig({
            translations: [{ lang: "en", default: true }, { lang: "fr" }]
        });

        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration: config,
            absolutePathToFernFolder: fernDir,
            absoluteFilepathToDocsConfig: configPath,
            context: createMockTaskContext()
        });

        const productOverlay = parsed.translationNavigationOverlays?.["fr"]?.products?.[0];
        expect(productOverlay?.displayName).toBe("Plateforme");
        expect(productOverlay?.versions).toHaveLength(2);
        expect(productOverlay?.versions?.[0]?.displayName).toBe("V4");
        expect(productOverlay?.versions?.[0]?.tabs?.["docs"]?.displayName).toBe("Documentation");
        // Second version has no `path:` and should still parse with display-name only
        expect(productOverlay?.versions?.[1]?.displayName).toBe("Hérité");
        expect(productOverlay?.versions?.[1]?.tabs).toBeUndefined();
    });

    it("should warn and skip when a version's path escapes the translations directory", async () => {
        const fernDir = tmpDir as AbsoluteFilePath;
        const configPath = path.join(tmpDir, "docs.yml") as AbsoluteFilePath;
        await writeFile(configPath, "");

        const frDir = path.join(tmpDir, "translations", "fr");
        await mkdir(frDir, { recursive: true });
        await writeFile(
            path.join(frDir, "docs.yml"),
            ["versions:", "  - display-name: V1", "    path: ../../../etc/passwd"].join("\n") + "\n"
        );

        const config = makeMinimalRawConfig({
            translations: [{ lang: "en", default: true }, { lang: "fr" }]
        });

        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration: config,
            absolutePathToFernFolder: fernDir,
            absoluteFilepathToDocsConfig: configPath,
            context: createMockTaskContext()
        });

        const versionOverlay = parsed.translationNavigationOverlays?.["fr"]?.versions?.[0];
        expect(versionOverlay?.displayName).toBe("V1");
        expect(versionOverlay?.tabs).toBeUndefined();
        expect(versionOverlay?.navigation).toBeUndefined();
    });
});

describe("parseDocsConfiguration — translation navbar-links overrides", () => {
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), "fern-translations-navbar-test-"));
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    it("should parse navbar-links from a translation overlay docs.yml", async () => {
        const fernDir = tmpDir as AbsoluteFilePath;
        const configPath = path.join(tmpDir, "docs.yml") as AbsoluteFilePath;
        await writeFile(configPath, "");

        const frDir = path.join(tmpDir, "translations", "fr");
        await mkdir(frDir, { recursive: true });
        await writeFile(
            path.join(frDir, "docs.yml"),
            [
                "navbar-links:",
                "  - type: filled",
                "    text: Commencer",
                "    href: https://example.com/fr/start",
                "  - type: github",
                "    value: https://github.com/example/repo"
            ].join("\n") + "\n"
        );

        const config = makeMinimalRawConfig({
            translations: [{ lang: "en", default: true }, { lang: "fr" }]
        });

        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration: config,
            absolutePathToFernFolder: fernDir,
            absoluteFilepathToDocsConfig: configPath,
            context: createMockTaskContext()
        });

        const navbarLinks = parsed.translationNavigationOverlays?.["fr"]?.navbarLinks;
        expect(navbarLinks).toBeDefined();
        expect(navbarLinks).toHaveLength(2);
        expect(navbarLinks?.[0]).toMatchObject({ type: "filled", text: "Commencer" });
        expect(navbarLinks?.[1]).toMatchObject({ type: "github" });
    });

    it("should leave navbarLinks undefined when overlay does not specify navbar-links", async () => {
        const fernDir = tmpDir as AbsoluteFilePath;
        const configPath = path.join(tmpDir, "docs.yml") as AbsoluteFilePath;
        await writeFile(configPath, "");

        const frDir = path.join(tmpDir, "translations", "fr");
        await mkdir(frDir, { recursive: true });
        await writeFile(path.join(frDir, "docs.yml"), "announcement:\n  message: Bienvenue\n");

        const config = makeMinimalRawConfig({
            translations: [{ lang: "en", default: true }, { lang: "fr" }]
        });

        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration: config,
            absolutePathToFernFolder: fernDir,
            absoluteFilepathToDocsConfig: configPath,
            context: createMockTaskContext()
        });

        expect(parsed.translationNavigationOverlays?.["fr"]?.navbarLinks).toBeUndefined();
    });

    it("should drop invalid navbar-link entries with a warning but keep valid ones", async () => {
        const fernDir = tmpDir as AbsoluteFilePath;
        const configPath = path.join(tmpDir, "docs.yml") as AbsoluteFilePath;
        await writeFile(configPath, "");

        const frDir = path.join(tmpDir, "translations", "fr");
        await mkdir(frDir, { recursive: true });
        await writeFile(
            path.join(frDir, "docs.yml"),
            [
                "navbar-links:",
                "  - type: filled",
                "    text: Valide",
                "    href: https://example.com/fr",
                "  - type: not-a-real-type",
                "    text: Invalide"
            ].join("\n") + "\n"
        );

        const config = makeMinimalRawConfig({
            translations: [{ lang: "en", default: true }, { lang: "fr" }]
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

        const navbarLinks = parsed.translationNavigationOverlays?.["fr"]?.navbarLinks;
        expect(navbarLinks).toHaveLength(1);
        expect(navbarLinks?.[0]).toMatchObject({ type: "filled", text: "Valide" });
        expect(warnings.some((w) => w.includes("Invalid navbar-link"))).toBe(true);
    });

    it("should treat an empty navbar-links list as a per-locale opt-out (not inherit)", async () => {
        const fernDir = tmpDir as AbsoluteFilePath;
        const configPath = path.join(tmpDir, "docs.yml") as AbsoluteFilePath;
        await writeFile(configPath, "");

        const frDir = path.join(tmpDir, "translations", "fr");
        await mkdir(frDir, { recursive: true });
        await writeFile(path.join(frDir, "docs.yml"), "navbar-links: []\n");

        const config = makeMinimalRawConfig({
            translations: [{ lang: "en", default: true }, { lang: "fr" }]
        });

        const parsed = await parseDocsConfiguration({
            rawDocsConfiguration: config,
            absolutePathToFernFolder: fernDir,
            absoluteFilepathToDocsConfig: configPath,
            context: createMockTaskContext()
        });

        const navbarLinks = parsed.translationNavigationOverlays?.["fr"]?.navbarLinks;
        expect(navbarLinks).toEqual([]);
    });

    it("should still produce an override (empty list) when every navbar-link entry is invalid", async () => {
        const fernDir = tmpDir as AbsoluteFilePath;
        const configPath = path.join(tmpDir, "docs.yml") as AbsoluteFilePath;
        await writeFile(configPath, "");

        const frDir = path.join(tmpDir, "translations", "fr");
        await mkdir(frDir, { recursive: true });
        await writeFile(
            path.join(frDir, "docs.yml"),
            ["navbar-links:", "  - type: not-a-real-type", "    text: Invalide"].join("\n") + "\n"
        );

        const config = makeMinimalRawConfig({
            translations: [{ lang: "en", default: true }, { lang: "fr" }]
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

        const navbarLinks = parsed.translationNavigationOverlays?.["fr"]?.navbarLinks;
        expect(navbarLinks).toEqual([]);
        expect(warnings.some((w) => w.includes("Invalid navbar-link"))).toBe(true);
    });
});
