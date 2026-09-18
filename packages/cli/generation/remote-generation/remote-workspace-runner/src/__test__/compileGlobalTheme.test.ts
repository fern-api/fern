import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { mkdtemp, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { describe, expect, it } from "vitest";
import {
    canMergeThemeServerSide,
    compileGlobalTheme,
    shouldMergeThemeServerSide,
    THEME_FILE_PATH_PREFIX,
    themeReferencesRemoteAssets
} from "../compileGlobalTheme.js";

// 1x1 transparent PNG
const PNG = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "base64"
);

async function writeThemeDir(): Promise<AbsoluteFilePath> {
    const dir = await mkdtemp(join(tmpdir(), "fern-theme-"));
    await writeFile(join(dir, "logo.png"), PNG);
    // Trailing byte keeps the hash distinct from logo.png; decoders ignore it.
    await writeFile(join(dir, "favicon.png"), Buffer.concat([PNG, Buffer.from([0])]));
    return AbsoluteFilePath.of(dir);
}

describe("compileGlobalTheme", () => {
    it("compiles theme fields into a ledger fragment with a hashed, namespaced file manifest", async () => {
        const themeDirectory = await writeThemeDir();
        const compiled = await compileGlobalTheme({
            rawTheme: {
                logo: { dark: "logo.png", light: "logo.png", height: 32 },
                favicon: "favicon.png",
                colors: { accentPrimary: { dark: "#ff0000", light: "#00ff00" } },
                announcement: { message: "Hello" }
            },
            themeDirectory,
            taskContext: createMockTaskContext(),
            cliVersion: "0.0.0"
        });

        expect(compiled.config.announcement).toEqual({ text: "Hello" });
        expect(compiled.config.logoHeight).toBe(32);
        expect(compiled.config.favicon).toBe(`${THEME_FILE_PATH_PREFIX}favicon.png`);
        expect(compiled.config.colorsV3?.type).toBe("darkAndLight");
        // Site-only fields must not leak into the fragment, or theme-wins
        // merging would clobber them.
        expect(compiled.config).not.toHaveProperty("title");
        expect(compiled.config).not.toHaveProperty("navbarLinks");

        const manifestKeys = Object.keys(compiled.fileManifest).sort();
        expect(manifestKeys).toEqual([`${THEME_FILE_PATH_PREFIX}favicon.png`, `${THEME_FILE_PATH_PREFIX}logo.png`]);
        const logo = compiled.fileManifest[`${THEME_FILE_PATH_PREFIX}logo.png`];
        expect(logo).toMatchObject({ contentType: "image/png", width: 1, height: 1, filename: "logo.png" });
        expect(compiled.files.get(logo?.hash ?? "")).toBe(join(themeDirectory, "logo.png"));
    });

    it("strips resolver defaults from partial theme/settings objects and maps logo right-text", async () => {
        const themeDirectory = await writeThemeDir();
        const compiled = await compileGlobalTheme({
            rawTheme: {
                logo: { dark: "logo.png", light: "logo.png", "right-text": "Docs" },
                theme: { tabs: "pill" },
                settings: { "http-snippets": false }
            },
            themeDirectory,
            taskContext: createMockTaskContext(),
            cliVersion: "0.0.0"
        });

        expect(compiled.config.logoRightText).toBe("Docs");
        expect(compiled.config.theme).toEqual({ tabs: "pill" });
        expect(compiled.config.settings).toEqual({ httpSnippets: false });
    });

    it("only keeps the colors the theme explicitly sets, per mode", async () => {
        const compiled = await compileGlobalTheme({
            rawTheme: { colors: { background: { dark: "#000000", light: "#ffffff" }, border: "#123456" } },
            themeDirectory: await writeThemeDir(),
            taskContext: createMockTaskContext(),
            cliVersion: "0.0.0"
        });

        const colors = compiled.config.colorsV3;
        expect(colors?.type).toBe("darkAndLight");
        if (colors?.type !== "darkAndLight") {
            throw new Error("expected darkAndLight palette");
        }
        // The resolver invents a random accentPrimary; it must never reach the fragment.
        expect(Object.keys(colors.dark).sort()).toEqual(["background", "border"]);
        expect(Object.keys(colors.light).sort()).toEqual(["background", "border"]);
    });

    it("only keeps the palette parts the theme sets when colors are not themed", async () => {
        const themeDirectory = await writeThemeDir();
        const compiled = await compileGlobalTheme({
            rawTheme: { logo: { dark: "logo.png", light: "logo.png" } },
            themeDirectory,
            taskContext: createMockTaskContext(),
            cliVersion: "0.0.0"
        });

        const colors = compiled.config.colorsV3;
        expect(colors?.type).toBe("darkAndLight");
        if (colors?.type === "darkAndLight") {
            expect(Object.keys(colors.dark)).toEqual(["logo"]);
            expect(Object.keys(colors.light)).toEqual(["logo"]);
        }
    });

    it("leaves header/footer components out of the fragment and flags them for local stitching", async () => {
        const themeDirectory = await writeThemeDir();
        await writeFile(join(themeDirectory, "header.tsx"), "export default function Header() { return null; }");
        const rawTheme = { header: "header.tsx", announcement: { message: "Hi" } };

        expect(canMergeThemeServerSide(rawTheme)).toBe(false);
        expect(canMergeThemeServerSide({ announcement: { message: "Hi" } })).toBe(true);

        const compiled = await compileGlobalTheme({
            rawTheme,
            themeDirectory,
            taskContext: createMockTaskContext(),
            cliVersion: "0.0.0"
        });
        expect(compiled.config).not.toHaveProperty("header");
        expect(compiled.config.announcement).toEqual({ text: "Hi" });
    });
});

describe("themeReferencesRemoteAssets", () => {
    it("detects remote URLs in logo, favicon, background-image and css", () => {
        expect(themeReferencesRemoteAssets({ logo: { dark: "https://cdn.example.com/logo.png" } })).toBe(true);
        expect(themeReferencesRemoteAssets({ favicon: "https://cdn.example.com/favicon.ico" })).toBe(true);
        expect(themeReferencesRemoteAssets({ "background-image": "https://cdn.example.com/bg.png" })).toBe(true);
        expect(themeReferencesRemoteAssets({ css: ["local.css", "https://cdn.example.com/a.css"] })).toBe(true);
        expect(themeReferencesRemoteAssets({ logo: { dark: "logo.png" }, favicon: "favicon.png", css: "a.css" })).toBe(
            false
        );
    });
});

describe("shouldMergeThemeServerSide", () => {
    const compiledTheme = { config: { announcement: { message: "Hi" } }, compiledHash: "abc" };

    it("merges server-side only for ledger deploys of themes with a compiled fragment", () => {
        expect(shouldMergeThemeServerSide({ deployMode: "ledger", theme: compiledTheme })).toBe(true);
        expect(shouldMergeThemeServerSide({ deployMode: "legacy", theme: compiledTheme })).toBe(false);
        expect(shouldMergeThemeServerSide({ deployMode: "ledger", theme: undefined })).toBe(false);
    });

    it("falls back to local stitching for themes uploaded by CLIs without compiled fragments", () => {
        expect(
            shouldMergeThemeServerSide({ deployMode: "ledger", theme: { ...compiledTheme, compiledHash: undefined } })
        ).toBe(false);
    });

    it("falls back to local stitching for themes with header/footer components", () => {
        expect(
            shouldMergeThemeServerSide({
                deployMode: "ledger",
                theme: { ...compiledTheme, config: { header: "header.tsx" } }
            })
        ).toBe(false);
    });
});
