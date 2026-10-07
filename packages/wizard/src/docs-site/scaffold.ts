// biome-ignore-all lint/suspicious/noConsole: CLI reports existing files that are preserved.

import type { Dirent } from "fs";
import { access, copyFile, mkdir, readdir, readFile, stat, writeFile } from "fs/promises";
import path from "path";
import { parse, stringify } from "yaml";
import { BUTTON_SHAPES, type DocsSiteChoices, LAYOUTS, TYPOGRAPHY_OPTIONS } from "./options";

const DOCS_SCHEMA_HEADER = "# yaml-language-server: $schema=https://schema.buildwithfern.dev/docs-yml.json";
const DOCS_SKIN_CSS = "docs/assets/onboarding-theme.css";
const CHROME_USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

interface ScaffoldOptions {
    dir: string;
    org: string;
    choices: DocsSiteChoices;
    fetchFontCss?: (url: string) => Promise<string | undefined>;
}

interface CopyOptions {
    protectedFiles: Set<string>;
    writtenFiles: Set<string>;
    skippedFiles: Set<string>;
    skipFile: (relativePath: string) => boolean;
    overwriteWrittenFiles: boolean;
}

type PlainObject = Record<string, unknown>;

export async function scaffoldDocsSite({
    dir,
    org,
    choices,
    fetchFontCss
}: ScaffoldOptions): Promise<{ written: string[]; skipped: string[] }> {
    const templateDir = await resolveTemplateDirectory();
    const fernDir = path.join(dir, "fern");
    await mkdir(fernDir, { recursive: true });

    const protectedFiles = await listFiles(fernDir);
    const writtenFiles = new Set<string>();
    const skippedFiles = new Set<string>();
    const existingApi =
        (await pathExists(path.join(fernDir, "generators.yml"))) || (await isDirectory(path.join(fernDir, "apis")));
    const copyOptions: CopyOptions = {
        protectedFiles,
        writtenFiles,
        skippedFiles,
        skipFile: (relativePath) => shouldSkipStarterFile(relativePath, choices, existingApi),
        overwriteWrittenFiles: false
    };

    await copyTemplateTree(path.join(templateDir, "base"), fernDir, "", copyOptions);

    const selectedLayout = LAYOUTS.find((layout) => layout.id === choices.layout);
    if (selectedLayout !== undefined && selectedLayout.id !== "layout-1") {
        const overlayDir = path.join(templateDir, "layouts", selectedLayout.id);
        await copyTemplateTree(path.join(overlayDir, "fern"), fernDir, "", {
            ...copyOptions,
            overwriteWrittenFiles: true
        });
    }

    if (writtenFiles.has("docs/pages/welcome.mdx")) {
        await applySiteTitleToWelcomeHero(path.join(fernDir, "docs", "pages", "welcome.mdx"), choices.siteTitle);
    }

    const baseConfig = await readYamlObject(path.join(templateDir, "base", "docs.yml"));
    const partialPath = path.join(templateDir, "layouts", choices.layout, "docs.partial.yml");
    if (await pathExists(partialPath)) {
        deepMergePlainObjects(baseConfig, await readYamlObject(partialPath));
    }

    customizeConfig(baseConfig, choices, existingApi);
    const logoPath = choices.logoPath;
    if (logoPath !== undefined) {
        await applyLogo(fernDir, dir, logoPath, baseConfig, protectedFiles, writtenFiles, skippedFiles);
    }

    if (choices.typography !== undefined || choices.buttonShape !== undefined) {
        await applyThemeCss(fernDir, baseConfig, choices, fetchFontCss, protectedFiles, writtenFiles, skippedFiles);
    }

    if (protectedFiles.has("docs.yml")) {
        recordSkipped("fern/docs.yml", skippedFiles);
    } else {
        await writeFile(path.join(fernDir, "docs.yml"), `${DOCS_SCHEMA_HEADER}\n${stringify(baseConfig)}`);
        recordWritten("docs.yml", writtenFiles);
    }

    const configPath = path.join(fernDir, "fern.config.json");
    if (protectedFiles.has("fern.config.json")) {
        recordSkipped("fern/fern.config.json", skippedFiles);
    } else {
        await writeFile(configPath, `${JSON.stringify({ organization: org, version: "5.59.0" }, null, 2)}\n`);
        recordWritten("fern.config.json", writtenFiles);
    }

    return {
        written: [...writtenFiles].map((file) => `fern/${file}`),
        skipped: [...skippedFiles]
    };
}

function resolveTemplateDirectory(): Promise<string> {
    const candidates = [
        path.resolve(__dirname, "../templates/docs-starter"),
        path.resolve(__dirname, "../../templates/docs-starter")
    ];
    return (async () => {
        for (const candidate of candidates) {
            if (await pathExists(candidate)) {
                return candidate;
            }
        }
        throw new Error("The bundled docs starter template could not be found.");
    })();
}

function shouldSkipStarterFile(relativePath: string, choices: DocsSiteChoices, existingApi: boolean): boolean {
    if (relativePath === "docs.yml" || relativePath === "fern.config.json") {
        return true;
    }
    if (!choices.features.includes("changelog") && relativePath.startsWith("docs/changelog/")) {
        return true;
    }
    if (!choices.features.includes("api-reference")) {
        return (
            relativePath === "openapi.yaml" ||
            relativePath === "asyncapi.yaml" ||
            relativePath === "generators.yml" ||
            relativePath === "docs/pages/api-reference-overview.mdx"
        );
    }
    return (
        existingApi &&
        (relativePath === "openapi.yaml" || relativePath === "asyncapi.yaml" || relativePath === "generators.yml")
    );
}

async function copyTemplateTree(
    sourceDir: string,
    destinationDir: string,
    relativeDirectory: string,
    options: CopyOptions
): Promise<void> {
    const entries = await readdir(sourceDir, { withFileTypes: true });
    for (const entry of entries) {
        const relativePath = path.join(relativeDirectory, entry.name);
        const portablePath = toPortablePath(relativePath);
        if (entry.isDirectory()) {
            if (options.skipFile(`${portablePath}/`)) {
                continue;
            }
            await mkdir(path.join(destinationDir, relativePath), { recursive: true });
            await copyTemplateTree(path.join(sourceDir, entry.name), destinationDir, relativePath, options);
            continue;
        }
        if (!entry.isFile()) {
            continue;
        }
        if (options.skipFile(portablePath)) {
            continue;
        }
        if (options.protectedFiles.has(portablePath)) {
            recordSkipped(`fern/${portablePath}`, options.skippedFiles);
            continue;
        }
        const target = path.join(destinationDir, relativePath);
        const exists = await pathExists(target);
        const canReplaceWrittenFile = options.overwriteWrittenFiles && options.writtenFiles.has(portablePath);
        if (exists && !canReplaceWrittenFile) {
            recordSkipped(`fern/${portablePath}`, options.skippedFiles);
            continue;
        }
        await mkdir(path.dirname(target), { recursive: true });
        await copyFile(path.join(sourceDir, entry.name), target);
        options.writtenFiles.add(portablePath);
    }
}

async function listFiles(directory: string, relativeDirectory = ""): Promise<Set<string>> {
    const files = new Set<string>();
    let entries: Dirent[];
    try {
        entries = await readdir(path.join(directory, relativeDirectory), { withFileTypes: true });
    } catch (error) {
        if (isNotFoundError(error)) {
            return files;
        }
        throw error;
    }
    for (const entry of entries) {
        const relativePath = path.join(relativeDirectory, entry.name);
        if (entry.isDirectory()) {
            for (const file of await listFiles(directory, relativePath)) {
                files.add(file);
            }
        } else {
            files.add(toPortablePath(relativePath));
        }
    }
    return files;
}

async function readYamlObject(filePath: string): Promise<PlainObject> {
    const value: unknown = parse(await readFile(filePath, "utf8"));
    if (!isPlainObject(value)) {
        throw new Error(`Expected a YAML object in ${filePath}`);
    }
    return value;
}

async function applySiteTitleToWelcomeHero(filePath: string, siteTitle: string): Promise<void> {
    const mdx = await readFile(filePath, "utf8");
    const frontmatter = mdx.match(/^(---\r?\n)([\s\S]*?)(\r?\n---)/);
    if (frontmatter === null) {
        return;
    }
    const open = frontmatter[1];
    const body = frontmatter[2];
    const close = frontmatter[3];
    if (open === undefined || body === undefined || close === undefined) {
        return;
    }
    const nextBody = body.replace(
        /^(title:[ \t]*)(.*)$/m,
        (_line, key: string, value: string) => `${key}${value.replace(/(?<![a-zA-Z.])Fern(?![a-zA-Z])/g, siteTitle)}`
    );
    if (nextBody !== body) {
        await writeFile(filePath, `${open}${nextBody}${close}${mdx.slice(frontmatter[0].length)}`);
    }
}

function deepMergePlainObjects(target: PlainObject, source: PlainObject): PlainObject {
    for (const [key, value] of Object.entries(source)) {
        const current = target[key];
        if (isPlainObject(current) && isPlainObject(value)) {
            deepMergePlainObjects(current, value);
        } else {
            target[key] = value;
        }
    }
    return target;
}

function customizeConfig(config: PlainObject, choices: DocsSiteChoices, existingApi: boolean): void {
    const instances = Array.isArray(config.instances) ? config.instances : [];
    const firstInstance = isPlainObject(instances[0]) ? instances[0] : {};
    firstInstance.url = `${choices.subdomain}.docs.buildwithfern.com`;
    config.instances = [firstInstance, ...instances.slice(1)];
    config.title = `${choices.siteTitle} | Documentation`;

    if (choices.primaryColor !== undefined) {
        const colors = getOrCreateObject(config, "colors");
        colors["accent-primary"] = { light: choices.primaryColor, dark: choices.primaryColor };
    }

    if (choices.features.includes("ask-fern")) {
        if (!isPlainObject(config["ai-search"])) {
            config["ai-search"] = {};
        }
    } else {
        delete config["ai-search"];
    }

    if (!choices.features.includes("api-reference")) {
        const tabs = getObject(config, "tabs");
        if (tabs !== undefined) {
            delete tabs["API Reference"];
        }
        if (Array.isArray(config.navigation)) {
            config.navigation = config.navigation.filter((item) => !isTab(item, "API Reference"));
        }
    } else if (existingApi) {
        replacePlantStoreApi(config);
    }

    if (!choices.features.includes("changelog")) {
        removeChangelogFromNavigation(config);
    }

    if (choices.typography !== undefined) {
        const typography = TYPOGRAPHY_OPTIONS.find((option) => option.id === choices.typography);
        if (typography !== undefined) {
            config.typography = {
                headingsFont: { name: typography.headingFont },
                bodyFont: { name: typography.bodyFont }
            };
        }
    }
}

async function applyLogo(
    fernDir: string,
    repoDir: string,
    logoPath: string,
    config: PlainObject,
    protectedFiles: Set<string>,
    writtenFiles: Set<string>,
    skippedFiles: Set<string>
): Promise<void> {
    const sourcePath = path.isAbsolute(logoPath) ? logoPath : path.resolve(repoDir, logoPath);
    const extension = path.extname(sourcePath) || ".svg";
    const relativePath = `docs/assets/logo-light${extension}`;
    const portablePath = relativePath;
    if (protectedFiles.has(portablePath)) {
        recordSkipped(`fern/${portablePath}`, skippedFiles);
    } else {
        const targetPath = path.join(fernDir, relativePath);
        await mkdir(path.dirname(targetPath), { recursive: true });
        await copyFile(sourcePath, targetPath);
        recordWritten(portablePath, writtenFiles);
    }
    const logo = getOrCreateObject(config, "logo");
    logo.light = relativePath;
    logo.dark = relativePath;
}

async function applyThemeCss(
    fernDir: string,
    config: PlainObject,
    choices: DocsSiteChoices,
    fetchFontCss: ((url: string) => Promise<string | undefined>) | undefined,
    protectedFiles: Set<string>,
    writtenFiles: Set<string>,
    skippedFiles: Set<string>
): Promise<void> {
    const blocks: string[] = [];
    if (choices.typography !== undefined) {
        const typography = TYPOGRAPHY_OPTIONS.find((option) => option.id === choices.typography);
        if (typography !== undefined) {
            config.typography = {
                headingsFont: { name: typography.headingFont },
                bodyFont: { name: typography.bodyFont }
            };
            const fontCss = await (fetchFontCss ?? defaultFetchFontCss)(googleFontUrl(typography));
            const typographyCss = `:root {\n    --font-heading: "${typography.headingFont}", sans-serif !important;\n    --font-body: "${typography.bodyFont}", sans-serif !important;\n}\n`;
            blocks.push(fontCss ? `${fontCss}\n${typographyCss}` : typographyCss);
        }
    }
    if (choices.buttonShape !== undefined) {
        const shape = BUTTON_SHAPES.find((option) => option.id === choices.buttonShape);
        if (shape !== undefined) {
            blocks.push(`:root {\n    --radius: ${shape.radius} !important;\n}\n`);
        }
    }
    await mkdir(path.join(fernDir, "docs", "assets"), { recursive: true });
    if (protectedFiles.has(DOCS_SKIN_CSS)) {
        recordSkipped(`fern/${DOCS_SKIN_CSS}`, skippedFiles);
    } else {
        await writeFile(path.join(fernDir, DOCS_SKIN_CSS), blocks.join("\n"));
        recordWritten(DOCS_SKIN_CSS, writtenFiles);
    }
    appendCssPath(config);
}

function googleFontUrl(typography: (typeof TYPOGRAPHY_OPTIONS)[number]): string {
    const families =
        typography.headingSlug === typography.bodySlug
            ? `family=${typography.headingSlug}:wght@400;600;700`
            : `family=${typography.headingSlug}:wght@400;600;700&family=${typography.bodySlug}`;
    return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

async function defaultFetchFontCss(url: string): Promise<string | undefined> {
    try {
        const response = await globalThis.fetch(url, { headers: { "User-Agent": CHROME_USER_AGENT } });
        return response.ok ? await response.text() : undefined;
    } catch {
        return undefined;
    }
}

function appendCssPath(config: PlainObject): void {
    const css = config.css;
    if (Array.isArray(css)) {
        if (!css.includes(DOCS_SKIN_CSS)) {
            config.css = [...css, DOCS_SKIN_CSS];
        }
    } else if (typeof css === "string" && css.trim().length > 0) {
        config.css = css === DOCS_SKIN_CSS ? css : [css, DOCS_SKIN_CSS];
    } else {
        config.css = DOCS_SKIN_CSS;
    }
}

function removeChangelogFromNavigation(config: PlainObject): void {
    const tabs = getObject(config, "tabs");
    if (tabs !== undefined) {
        delete tabs.changelog;
    }
    if (Array.isArray(config.navigation)) {
        const navigation = removeChangelogReferences(config.navigation);
        if (Array.isArray(navigation)) {
            config.navigation = navigation.filter((item) => !isTab(item, "changelog"));
        }
    }
}

function removeChangelogReferences(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value
            .filter((item) => !(isPlainObject(item) && item.changelog === "docs/changelog"))
            .map((item) => removeChangelogReferences(item));
    }
    if (isPlainObject(value)) {
        for (const [key, child] of Object.entries(value)) {
            value[key] = removeChangelogReferences(child);
        }
    }
    return value;
}

function replacePlantStoreApi(config: PlainObject): void {
    if (!Array.isArray(config.navigation)) {
        return;
    }
    for (const item of config.navigation) {
        if (!isTab(item, "API Reference") || !Array.isArray(item.layout)) {
            continue;
        }
        item.layout = item.layout.map((entry) =>
            isPlainObject(entry) && entry.api === "Plant Store API" ? { api: "API Reference" } : entry
        );
    }
}

function isTab(value: unknown, tabName: string): value is PlainObject & { tab: string } {
    return isPlainObject(value) && value.tab === tabName;
}

function getObject(value: PlainObject, key: string): PlainObject | undefined {
    const item = value[key];
    return isPlainObject(item) ? item : undefined;
}

function getOrCreateObject(value: PlainObject, key: string): PlainObject {
    const item = getObject(value, key);
    if (item !== undefined) {
        return item;
    }
    const next: PlainObject = {};
    value[key] = next;
    return next;
}

function isPlainObject(value: unknown): value is PlainObject {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return false;
    }
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
}

function recordSkipped(file: string, skippedFiles: Set<string>): void {
    if (!skippedFiles.has(file)) {
        skippedFiles.add(file);
        console.log(`${file} already exists, skipping`);
    }
}

function recordWritten(file: string, writtenFiles: Set<string>): void {
    writtenFiles.add(file);
}

async function pathExists(filePath: string): Promise<boolean> {
    try {
        await access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function isDirectory(filePath: string): Promise<boolean> {
    try {
        return (await stat(filePath)).isDirectory();
    } catch {
        return false;
    }
}

function isNotFoundError(error: unknown): boolean {
    return error instanceof Error && "code" in error && error.code === "ENOENT";
}

function toPortablePath(filePath: string): string {
    return filePath.split(path.sep).join("/");
}
