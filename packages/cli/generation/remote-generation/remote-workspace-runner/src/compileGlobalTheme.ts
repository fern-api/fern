import { docsYml } from "@fern-api/configuration";
import { MediaType } from "@fern-api/core-utils";
import { DocsDefinitionResolver, FetchedGlobalTheme, mergeThemeOverride } from "@fern-api/docs-resolver";
import type { FileManifestEntry, LedgerConfig } from "@fern-api/fdr-sdk/orpc-client";
import { AbsoluteFilePath, isURL, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { DocsWorkspace } from "@fern-api/workspace-loader";
import { createHash } from "crypto";
import { readFile } from "fs/promises";
import * as mime from "mime-types";
import { basename } from "path";
import { isDeepStrictEqual } from "util";
import { DocsDeployMode } from "./docsDeployMode.js";
import { mapDocsConfigToLedgerConfig } from "./mapDocsConfigToLedgerConfig.js";
import { measureImageSizes } from "./measureImageSizes.js";

/**
 * Theme asset paths are namespaced so they can never collide with a file the
 * themed site references under the same relative path.
 */
export const THEME_FILE_PATH_PREFIX = "_theme/";

const MEASURE_IMAGE_BATCH_SIZE = 10;

/**
 * Theme-eligible docs.yml keys → the LedgerConfig keys they compile into.
 * `colorsV3` is handled separately because `colors`, `logo` and
 * `backgroundImage` all fold into it.
 */
const THEME_KEY_TO_LEDGER_KEYS: Record<docsYml.ThemeEligibleField, ReadonlyArray<keyof LedgerConfig>> = {
    logo: ["logoHeight", "logoHref", "logoRightText"],
    favicon: ["favicon"],
    backgroundImage: [],
    colors: [],
    typography: ["typographyV2"],
    layout: ["layout"],
    settings: ["settings"],
    theme: ["theme"],
    integrations: ["integrations"],
    css: ["css"],
    js: ["js"],
    header: [],
    footer: [],
    navbarLinks: ["navbarLinks"],
    footerLinks: ["footerLinks"],
    aiSearch: ["aiChatConfig"],
    announcement: ["announcement"],
    metadata: ["metadata"]
};

/**
 * Fields whose compiled output lives outside `config` (header/footer are
 * bundled into the per-locale `jsFiles` blob) and therefore cannot be merged
 * by FDR from a compiled theme fragment. Themes using them are stitched
 * locally at publish time and left out of the compiled fragment.
 */
export const THEME_FIELDS_REQUIRING_LOCAL_STITCH: ReadonlyArray<docsYml.ThemeEligibleField> = ["header", "footer"];

export interface CompiledGlobalTheme {
    /** Ledger-shaped fragment containing only the fields the theme sets. */
    config: LedgerConfig;
    /** Theme asset manifest keyed by `_theme/<relative path>`. */
    fileManifest: Record<string, FileManifestEntry>;
    /** Content hash → absolute path of every file in `fileManifest`. */
    files: Map<string, AbsoluteFilePath>;
}

/**
 * True when every field the theme sets can be merged server-side by FDR.
 */
export function canMergeThemeServerSide(rawTheme: Record<string, unknown>): boolean {
    return !THEME_FIELDS_REQUIRING_LOCAL_STITCH.some((field) => themeSetsField(rawTheme, field));
}

/** theme.yml keys are kebab-case, but `mergeThemeOverride` accepts camelCase too. */
function themeSetsField(rawTheme: Record<string, unknown>, field: docsYml.ThemeEligibleField): boolean {
    return rawTheme[camelToKebab(field)] != null || rawTheme[field] != null;
}

/**
 * Theme assets given as remote URLs are passed through by `theme upload`, but
 * the docs resolver only understands local paths, so such themes can't be
 * compiled and stay on local stitching.
 */
export function themeReferencesRemoteAssets(rawTheme: Record<string, unknown>): boolean {
    const values: unknown[] = [];
    const pushDarkLight = (value: unknown) => {
        if (typeof value === "string") {
            values.push(value);
        } else if (isPlainObject(value)) {
            values.push(value.dark, value.light);
        }
    };
    pushDarkLight(rawTheme.logo);
    pushDarkLight(rawTheme["background-image"] ?? rawTheme.backgroundImage);
    values.push(rawTheme.favicon);
    const css = rawTheme.css;
    values.push(...(Array.isArray(css) ? css : [css]));
    return values.some((value) => typeof value === "string" && isURL(value));
}

/**
 * Whether `fern docs publish` should send the unmerged config + theme name and
 * let FDR merge, so FDR can refresh every themed site when the theme changes.
 * Themes without a compiled fragment (uploaded by older CLIs) fall back to
 * local stitching, as do legacy (non-ledger) deploys.
 */
export function shouldMergeThemeServerSide({
    deployMode,
    theme
}: {
    deployMode: DocsDeployMode;
    theme: FetchedGlobalTheme | undefined;
}): boolean {
    return deployMode === "ledger" && theme?.compiledHash != null && canMergeThemeServerSide(theme.config);
}

/**
 * Compiles a raw theme.yml into the ledger-shaped fragment FDR merges into
 * each themed site at publish time. Reuses the docs resolver so images are
 * measured, fonts/CSS are resolved and paths are hashed exactly as they would
 * be for a normal publish.
 */
export async function compileGlobalTheme({
    rawTheme,
    themeDirectory,
    taskContext,
    cliVersion
}: {
    rawTheme: Record<string, unknown>;
    themeDirectory: AbsoluteFilePath;
    taskContext: TaskContext;
    cliVersion: string;
}): Promise<CompiledGlobalTheme> {
    const themeKeys = docsYml.THEME_ELIGIBLE_FIELDS.filter((field) => themeSetsField(rawTheme, field));

    const emptyDocsConfig = { instances: [], navigation: [] } as unknown as DocsWorkspace["config"];
    const workspace: DocsWorkspace = {
        type: "docs",
        workspaceName: undefined,
        absoluteFilePath: themeDirectory,
        absoluteFilepathToDocsConfig: join(themeDirectory, RelativeFilePath.of("theme.yml")),
        config: mergeThemeOverride(emptyDocsConfig, rawTheme)
    };

    const fileManifest: Record<string, FileManifestEntry> = {};
    const files = new Map<string, AbsoluteFilePath>();
    const fileIdToPath = new Map<string, string>();

    const resolver = new DocsDefinitionResolver({
        domain: "theme.invalid",
        docsWorkspace: workspace,
        ossWorkspaces: [],
        apiWorkspaces: [],
        taskContext,
        cliVersion,
        uploadFiles: async (uploads) => {
            const imageSizes = await measureImageSizes(
                uploads
                    .filter((file) => MediaType.parse(mime.lookup(file.absoluteFilePath) || "")?.isImage() ?? false)
                    .map((file) => file.absoluteFilePath),
                MEASURE_IMAGE_BATCH_SIZE,
                taskContext
            );
            return Promise.all(
                uploads.map(async (file) => {
                    const fileId = `${THEME_FILE_PATH_PREFIX}${file.relativeFilePath}`;
                    const buffer = await readFile(file.absoluteFilePath);
                    const hash = createHash("sha256").update(new Uint8Array(buffer)).digest("hex");
                    const image = imageSizes.get(file.absoluteFilePath);
                    fileManifest[fileId] = {
                        hash,
                        contentType: mime.lookup(file.absoluteFilePath) || "application/octet-stream",
                        contentLength: buffer.byteLength,
                        filename: basename(file.relativeFilePath),
                        ...(image != null && { width: image.width, height: image.height })
                    };
                    files.set(hash, file.absoluteFilePath);
                    // Theme file ids double as their manifest paths, so the
                    // ledger config references `_theme/...` directly.
                    fileIdToPath.set(fileId, fileId);
                    return { ...file, fileId };
                })
            );
        }
    });

    const docsDefinition = await resolver.resolve();
    const full = mapDocsConfigToLedgerConfig({
        docsConfig: docsDefinition.config,
        fileManifest,
        fileIdToPath,
        editThisPage: undefined
    });
    const defaults = await compileThemeDefaults({ rawTheme, themeKeys, themeDirectory, taskContext, cliVersion });

    const config: Record<string, unknown> = {};
    for (const themeKey of themeKeys) {
        for (const ledgerKey of THEME_KEY_TO_LEDGER_KEYS[themeKey]) {
            const value = stripDefaults(full[ledgerKey], defaults[ledgerKey]);
            if (value !== undefined) {
                config[ledgerKey] = value;
            }
        }
    }
    const colorsV3 = pickThemeColors(full.colorsV3, themeKeys, rawTheme);
    if (colorsV3 != null) {
        config.colorsV3 = colorsV3;
    }

    return { config: config as LedgerConfig, fileManifest, files };
}

/**
 * The resolver fills in defaults for omitted sub-fields of object-valued
 * config (`theme.sidebar: "default"`, `settings.httpSnippets: true`, ...).
 * Compiling the same object-valued keys as empty objects yields exactly those
 * defaults, so they can be stripped and never override a site's own values.
 */
async function compileThemeDefaults({
    rawTheme,
    themeKeys,
    themeDirectory,
    taskContext,
    cliVersion
}: {
    rawTheme: Record<string, unknown>;
    themeKeys: ReadonlyArray<docsYml.ThemeEligibleField>;
    themeDirectory: AbsoluteFilePath;
    taskContext: TaskContext;
    cliVersion: string;
}): Promise<LedgerConfig> {
    const emptyObjects: Record<string, unknown> = {};
    for (const key of themeKeys) {
        if (key !== "colors" && isPlainObject(rawTheme[camelToKebab(key)] ?? rawTheme[key])) {
            emptyObjects[key] = {};
        }
    }
    if (Object.keys(emptyObjects).length === 0) {
        return {} as LedgerConfig;
    }
    const emptyDocsConfig = { instances: [], navigation: [] } as unknown as DocsWorkspace["config"];
    const resolver = new DocsDefinitionResolver({
        domain: "theme.invalid",
        docsWorkspace: {
            type: "docs",
            workspaceName: undefined,
            absoluteFilePath: themeDirectory,
            absoluteFilepathToDocsConfig: join(themeDirectory, RelativeFilePath.of("theme.yml")),
            config: mergeThemeOverride(emptyDocsConfig, emptyObjects)
        },
        ossWorkspaces: [],
        apiWorkspaces: [],
        taskContext,
        cliVersion,
        uploadFiles: async (uploads) => uploads.map((file) => ({ ...file, fileId: file.relativeFilePath }))
    });
    const docsDefinition = await resolver.resolve();
    return mapDocsConfigToLedgerConfig({
        docsConfig: docsDefinition.config,
        fileManifest: {},
        fileIdToPath: new Map(),
        editThisPage: undefined
    });
}

/** Removes every leaf of `value` that equals the corresponding leaf of `defaults`. */
function stripDefaults(value: unknown, defaults: unknown): unknown {
    if (value === undefined || defaults === undefined) {
        return value;
    }
    if (!isPlainObject(value) || !isPlainObject(defaults)) {
        return isDeepStrictEqual(value, defaults) ? undefined : value;
    }
    const stripped: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
        const kept = stripDefaults(child, defaults[key]);
        if (kept !== undefined) {
            stripped[key] = kept;
        }
    }
    return Object.keys(stripped).length > 0 ? stripped : undefined;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

type LedgerColors = NonNullable<LedgerConfig["colorsV3"]>;
type LedgerPalette = Extract<LedgerColors, { type: "darkAndLight" }>["dark"];

/**
 * `colorsV3` folds `colors`, `logo` and `backgroundImage` together, and the
 * resolver fills palette defaults (including a random `accentPrimary`). Only
 * keep the colors the theme explicitly set for each mode, so defaults don't
 * clobber a site's own colors under theme-wins merging.
 */
function pickThemeColors(
    colors: LedgerConfig["colorsV3"],
    themeKeys: ReadonlyArray<docsYml.ThemeEligibleField>,
    rawTheme: Record<string, unknown>
): LedgerConfig["colorsV3"] {
    if (colors == null) {
        return undefined;
    }
    const rawColors = isPlainObject(rawTheme.colors) ? rawTheme.colors : {};
    const setsColor = (key: string, mode: "dark" | "light"): boolean => {
        const value = rawColors[camelToKebab(key)] ?? rawColors[key];
        return typeof value === "string" || (isPlainObject(value) && value[mode] != null);
    };
    const pick = (palette: LedgerPalette, mode: "dark" | "light"): Partial<LedgerPalette> => {
        const picked: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(palette)) {
            if (value == null) {
                continue;
            }
            const keep =
                key === "logo"
                    ? themeKeys.includes("logo")
                    : key === "backgroundImage"
                      ? themeKeys.includes("backgroundImage")
                      : setsColor(key, mode);
            if (keep) {
                picked[key] = value;
            }
        }
        return picked as Partial<LedgerPalette>;
    };
    if (colors.type === "darkAndLight") {
        const dark = pick(colors.dark, "dark");
        const light = pick(colors.light, "light");
        const hasValues = Object.keys(dark).length > 0 || Object.keys(light).length > 0;
        return hasValues ? ({ type: colors.type, dark, light } as LedgerConfig["colorsV3"]) : undefined;
    }
    const picked = pick(colors, colors.type);
    return Object.keys(picked).length > 0 ? ({ type: colors.type, ...picked } as LedgerConfig["colorsV3"]) : undefined;
}

function camelToKebab(value: string): string {
    return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}
