import { docsYml } from "@fern-api/configuration";
import { MediaType } from "@fern-api/core-utils";
import { DocsDefinitionResolver, FetchedGlobalTheme, mergeThemeOverride } from "@fern-api/docs-resolver";
import type { FileManifestEntry, LedgerConfig } from "@fern-api/fdr-sdk/orpc-client";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { DocsWorkspace } from "@fern-api/workspace-loader";
import { createHash } from "crypto";
import { readFile } from "fs/promises";
import * as mime from "mime-types";
import { basename } from "path";
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
    logo: ["logoHeight", "logoHref"],
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
    return !THEME_FIELDS_REQUIRING_LOCAL_STITCH.some((field) => rawTheme[camelToKebab(field)] != null);
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
    const themeKeys = docsYml.THEME_ELIGIBLE_FIELDS.filter((field) => rawTheme[camelToKebab(field)] != null);

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

    const config: Record<string, unknown> = {};
    for (const themeKey of themeKeys) {
        for (const ledgerKey of THEME_KEY_TO_LEDGER_KEYS[themeKey]) {
            if (full[ledgerKey] !== undefined) {
                config[ledgerKey] = full[ledgerKey];
            }
        }
    }
    const colorsV3 = pickThemeColors(full.colorsV3, themeKeys);
    if (colorsV3 != null) {
        config.colorsV3 = colorsV3;
    }

    return { config: config as LedgerConfig, fileManifest, files };
}

type LedgerColors = NonNullable<LedgerConfig["colorsV3"]>;
type LedgerPalette = Extract<LedgerColors, { type: "darkAndLight" }>["dark"];

/**
 * `colorsV3` folds `colors`, `logo` and `backgroundImage` together, and the
 * resolver fills palette defaults. Only keep the parts the theme actually set
 * so defaults don't clobber a site's own colors under theme-wins merging.
 */
function pickThemeColors(
    colors: LedgerConfig["colorsV3"],
    themeKeys: ReadonlyArray<docsYml.ThemeEligibleField>
): LedgerConfig["colorsV3"] {
    if (colors == null) {
        return undefined;
    }
    if (themeKeys.includes("colors")) {
        return colors;
    }
    const pick = (palette: LedgerPalette): Partial<LedgerPalette> => ({
        ...(themeKeys.includes("logo") && palette.logo != null && { logo: palette.logo }),
        ...(themeKeys.includes("backgroundImage") &&
            palette.backgroundImage != null && { backgroundImage: palette.backgroundImage })
    });
    const picked =
        colors.type === "darkAndLight"
            ? { type: colors.type, dark: pick(colors.dark), light: pick(colors.light) }
            : { type: colors.type, ...pick(colors) };
    const hasValues =
        colors.type === "darkAndLight"
            ? Object.keys(pick(colors.dark)).length > 0 || Object.keys(pick(colors.light)).length > 0
            : Object.keys(pick(colors)).length > 0;
    return hasValues ? (picked as LedgerConfig["colorsV3"]) : undefined;
}

function camelToKebab(value: string): string {
    return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}
