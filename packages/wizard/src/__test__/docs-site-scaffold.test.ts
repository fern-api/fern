import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { parse } from "yaml";
import { type DocsSiteChoices, defaultDocsSiteChoices, LAYOUTS } from "../docs-site/options";
import { scaffoldDocsSite } from "../docs-site/scaffold";

const tempDirs: string[] = [];

afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("docs site scaffolding", () => {
    it("writes valid docs.yml files and applies each layout overlay", async () => {
        for (const layout of LAYOUTS) {
            const dir = await tempRepo();
            const choices: DocsSiteChoices = {
                ...defaultDocsSiteChoices("acme", layout.id),
                siteTitle: "Acme API"
            };
            await scaffoldDocsSite({ dir, org: "acme", choices });

            const docsConfig = await readDocsConfig(dir);
            expect(docsConfig.title).toBe("Acme API | Documentation");
            expect(record(arrayField(docsConfig, "instances")[0]).url).toBe("acme.docs.buildwithfern.com");
            expect(await readFile(path.join(dir, "fern", "docs.yml"), "utf8")).toContain(
                "# yaml-language-server: $schema=https://schema.buildwithfern.dev/docs-yml.json"
            );
            expect(docsConfig["ai-search"]).toEqual({});
            expect(await pathExists(path.join(dir, "fern", "openapi.yaml"))).toBe(true);
            expect(await pathExists(path.join(dir, "fern", "generators.yml"))).toBe(true);

            const welcome = await readFile(path.join(dir, "fern", "docs", "pages", "welcome.mdx"), "utf8");
            expect(welcome).toContain("title: Welcome to Acme API!");
            expect(welcome).toContain("subtitle: Everything you need to build the best developer experience");

            if (layout.id === "layout-2") {
                expect(record(docsConfig.layout)["searchbar-placement"]).toBe("sidebar");
                expect(record(docsConfig.layout)["page-width"]).toBe("full");
                expect(record(docsConfig.theme).body).toBe("canvas");
            }
            if (layout.id === "layout-3") {
                expect(docsConfig.js).toBe("custom.js");
                expect(record(docsConfig.tabs).changelog).toBeDefined();
            }
        }
    });

    it("removes disabled features and their navigation and starter files", async () => {
        const dir = await tempRepo();
        const choices = { ...defaultDocsSiteChoices("acme", "layout-3"), features: [] };
        await scaffoldDocsSite({ dir, org: "acme", choices });

        const docsConfig = await readDocsConfig(dir);
        const tabs = record(docsConfig.tabs);
        const navigation = arrayField(docsConfig, "navigation");
        expect(tabs["API Reference"]).toBeUndefined();
        expect(tabs.changelog).toBeUndefined();
        expect(docsConfig["ai-search"]).toBeUndefined();
        expect(navigation.some((item) => isRecord(item) && item.tab === "API Reference")).toBe(false);
        expect(navigation.some((item) => isRecord(item) && item.tab === "changelog")).toBe(false);
        expect(referencesChangelog(navigation)).toBe(false);

        for (const file of [
            "openapi.yaml",
            "asyncapi.yaml",
            "generators.yml",
            "docs/pages/api-reference-overview.mdx",
            "docs/changelog/overview.mdx"
        ]) {
            expect(await pathExists(path.join(dir, "fern", file))).toBe(false);
        }
    });

    it("keeps the overview and points API Reference at an existing API", async () => {
        for (const existingApi of ["generators", "apis"]) {
            const dir = await tempRepo();
            const fernDir = path.join(dir, "fern");
            if (existingApi === "generators") {
                await mkdir(fernDir, { recursive: true });
                await writeFile(path.join(fernDir, "generators.yml"), "custom: true\n");
            } else {
                await mkdir(path.join(fernDir, "apis"), { recursive: true });
            }
            await scaffoldDocsSite({ dir, org: "acme", choices: defaultDocsSiteChoices("acme") });

            expect(await pathExists(path.join(fernDir, "openapi.yaml"))).toBe(false);
            expect(await pathExists(path.join(fernDir, "asyncapi.yaml"))).toBe(false);
            const docsConfig = await readDocsConfig(dir);
            const apiNavigation = arrayField(docsConfig, "navigation").find(
                (item) => isRecord(item) && item.tab === "API Reference"
            );
            if (!isRecord(apiNavigation)) {
                throw new Error("API Reference navigation was not written.");
            }
            const apiLayout = arrayField(apiNavigation, "layout");
            expect(record(apiLayout[0]).section).toBe("Overview");
            expect(apiLayout.find((item) => isRecord(item) && "api" in item)).toEqual({ api: "API Reference" });
            if (existingApi === "generators") {
                await expect(readFile(path.join(fernDir, "generators.yml"), "utf8")).resolves.toBe("custom: true\n");
            } else {
                expect(await pathExists(path.join(fernDir, "generators.yml"))).toBe(false);
            }
        }
    });

    it("does not overwrite customer files and reports paths it skipped", async () => {
        const dir = await tempRepo();
        const fernDir = path.join(dir, "fern");
        const welcomePage = path.join(fernDir, "docs", "pages", "welcome.mdx");
        const configPath = path.join(fernDir, "fern.config.json");
        await mkdir(path.dirname(welcomePage), { recursive: true });
        await mkdir(path.join(fernDir, "docs", "assets"), { recursive: true });
        await writeFile(welcomePage, "customer content");
        await writeFile(configPath, '{"organization":"original"}\n');
        await writeFile(path.join(fernDir, "docs", "assets", "onboarding-theme.css"), "customer css");
        const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

        let result: Awaited<ReturnType<typeof scaffoldDocsSite>>;
        try {
            result = await scaffoldDocsSite({
                dir,
                org: "acme",
                choices: { ...defaultDocsSiteChoices("acme"), buttonShape: "sharp" }
            });
            expect(log).toHaveBeenCalledWith("fern/docs/pages/welcome.mdx already exists, skipping");
        } finally {
            log.mockRestore();
        }

        expect(result.skipped).toEqual(
            expect.arrayContaining([
                "fern/docs/pages/welcome.mdx",
                "fern/fern.config.json",
                "fern/docs/assets/onboarding-theme.css"
            ])
        );
        expect(result.written).toContain("fern/docs.yml");
        await expect(readFile(welcomePage, "utf8")).resolves.toBe("customer content");
        await expect(readFile(configPath, "utf8")).resolves.toBe('{"organization":"original"}\n');
        await expect(readFile(path.join(fernDir, "docs", "assets", "onboarding-theme.css"), "utf8")).resolves.toBe(
            "customer css"
        );
    });

    it("applies color, logo, typography, and button branding", async () => {
        const dir = await tempRepo();
        await writeFile(path.join(dir, "brand.png"), "custom logo");
        const fontUrls: string[] = [];
        const choices: DocsSiteChoices = {
            ...defaultDocsSiteChoices("acme"),
            primaryColor: "#aabbcc",
            logoPath: "brand.png",
            typography: "editorial",
            buttonShape: "round"
        };
        await scaffoldDocsSite({
            dir,
            org: "acme",
            choices,
            fetchFontCss: async (url) => {
                fontUrls.push(url);
                return "/* fetched font rules */";
            }
        });

        const docsConfig = await readDocsConfig(dir);
        expect(record(record(docsConfig.colors)["accent-primary"])).toEqual({
            light: "#aabbcc",
            dark: "#aabbcc"
        });
        expect(record(docsConfig.logo)).toMatchObject({
            light: "docs/assets/logo-light.png",
            dark: "docs/assets/logo-light.png",
            height: 20
        });
        expect(record(docsConfig.typography)).toEqual({
            headingsFont: { name: "Playfair Display" },
            bodyFont: { name: "Vollkorn" }
        });
        expect(docsConfig.css).toEqual(["styles.css", "docs/assets/onboarding-theme.css"]);
        expect(fontUrls).toEqual([
            "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Vollkorn&display=swap"
        ]);
        const themeCss = await readFile(path.join(dir, "fern", "docs", "assets", "onboarding-theme.css"), "utf8");
        expect(themeCss).toContain("/* fetched font rules */");
        expect(themeCss).toContain('--font-heading: "Playfair Display", sans-serif !important;');
        expect(themeCss).toContain('--font-body: "Vollkorn", sans-serif !important;');
        expect(themeCss).toContain("--radius: .80rem !important;");
        await expect(readFile(path.join(dir, "fern", "docs", "assets", "logo-light.png"), "utf8")).resolves.toBe(
            "custom logo"
        );
    });

    it("writes the Fern CLI config only when one is missing", async () => {
        const dir = await tempRepo();
        await scaffoldDocsSite({ dir, org: "acme", choices: defaultDocsSiteChoices("acme") });
        await expect(readFile(path.join(dir, "fern", "fern.config.json"), "utf8")).resolves.toContain(
            '"organization": "acme"'
        );
        await expect(readFile(path.join(dir, "fern", "fern.config.json"), "utf8")).resolves.toContain(
            '"version": "5.59.0"'
        );
    });
});

async function tempRepo(): Promise<string> {
    const dir = await mkdtemp(path.join(os.tmpdir(), "fern-wizard-docs-site-"));
    tempDirs.push(dir);
    return dir;
}

async function readDocsConfig(dir: string): Promise<Record<string, unknown>> {
    return record(parse(await readFile(path.join(dir, "fern", "docs.yml"), "utf8")));
}

function record(value: unknown): Record<string, unknown> {
    if (!isRecord(value)) {
        throw new Error("Expected an object.");
    }
    return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function arrayField(value: Record<string, unknown>, key: string): unknown[] {
    const field = value[key];
    if (!Array.isArray(field)) {
        throw new Error(`Expected ${key} to be an array.`);
    }
    return field;
}

function referencesChangelog(value: unknown): boolean {
    if (Array.isArray(value)) {
        return value.some(referencesChangelog);
    }
    if (!isRecord(value)) {
        return false;
    }
    return value.changelog === "docs/changelog" || Object.values(value).some(referencesChangelog);
}

async function pathExists(filePath: string): Promise<boolean> {
    try {
        await access(filePath);
        return true;
    } catch {
        return false;
    }
}
