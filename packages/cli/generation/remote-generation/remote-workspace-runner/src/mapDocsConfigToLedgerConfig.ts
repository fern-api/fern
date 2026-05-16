import type { DocsV1Write } from "@fern-api/fdr-sdk";
import type { FileManifestEntry, ImageRef, LedgerConfig, PathOrUrl } from "@fern-api/fdr-sdk/orpc-client";

type DocsConfig = DocsV1Write.DocsConfig;

/**
 * Resolve a FileId reference produced by the classic docs publish flow
 * (FDR's startDocsRegister) to the `fullPath` string that the ledger flow
 * uses to identify file artifacts.
 *
 * In the current FDR behaviour (`extractFileId` in publishDocs.ts), the
 * "fileId" returned by FDR for a freshly-uploaded file is the same
 * sanitized path used as the ledger fileManifest key, so the lookup is
 * effectively the identity function. We still consult `fileIdToPath`
 * first to remain forward-compatible with the legacy server response
 * shape ({ uploadUrl, fileId }) where fileId is a separate UUID.
 *
 * Returns undefined when the FileId can't be mapped — callers MUST
 * treat that as "field absent" rather than fabricating a path string.
 */
function resolveFileIdToPath(
    fileId: string | undefined,
    fileIdToPath: Map<string, string> | undefined
): string | undefined {
    if (fileId == null) {
        return undefined;
    }
    const mapped = fileIdToPath?.get(fileId);
    if (mapped != null) {
        return mapped;
    }
    // Fallback: in the current FDR flow the fileId IS the sanitized path,
    // so we can pass it through unchanged.
    return fileId;
}

function toImageRef(
    fileId: string | undefined,
    fileManifest: Record<string, FileManifestEntry> | undefined,
    fileIdToPath: Map<string, string> | undefined
): ImageRef | undefined {
    const path = resolveFileIdToPath(fileId, fileIdToPath);
    if (path == null) {
        return undefined;
    }
    const entry = fileManifest?.[path];
    if (entry?.width == null || entry?.height == null) {
        // Dimensions are required for ImageRef (next/image layout reservation).
        // If the file wasn't measured (e.g. SVG or missing manifest entry) we
        // drop the logo from the ledger config rather than send a half-valid
        // ref that would fail server-side validation.
        return undefined;
    }
    return { path, width: entry.width, height: entry.height };
}

function toPathOrUrl(
    fileIdOrUrl: { type: "fileId"; value: string } | { type: "url"; value: string } | undefined,
    fileIdToPath: Map<string, string> | undefined
): PathOrUrl | undefined {
    if (fileIdOrUrl == null) {
        return undefined;
    }
    if (fileIdOrUrl.type === "url") {
        return { type: "url", value: fileIdOrUrl.value };
    }
    const path = resolveFileIdToPath(fileIdOrUrl.value, fileIdToPath);
    if (path == null) {
        return undefined;
    }
    return { type: "path", value: path };
}

type ThemeWithImages = Extract<NonNullable<DocsConfig["colorsV3"]>, { type: "dark" } | { type: "light" }>;

function mapTheme(
    theme: ThemeWithImages | NonNullable<Extract<DocsConfig["colorsV3"], { type: "darkAndLight" }>>["dark"],
    fileManifest: Record<string, FileManifestEntry> | undefined,
    fileIdToPath: Map<string, string> | undefined
): {
    logo?: ImageRef;
    backgroundImage?: string;
    accentPrimary: { r: number; g: number; b: number; a?: number };
    background?: { type: "solid"; r: number; g: number; b: number; a?: number } | { type: "gradient" };
    border?: { r: number; g: number; b: number; a?: number };
    sidebarBackground?: { r: number; g: number; b: number; a?: number };
    headerBackground?: { r: number; g: number; b: number; a?: number };
    cardBackground?: { r: number; g: number; b: number; a?: number };
} {
    // DocsConfig's per-theme `background` is a plain RGBA; LedgerConfig
    // wraps it in a `solid` discriminated-union variant. We do not produce
    // the `gradient` variant because DocsConfig has no source for it.
    const background = theme.background != null ? { type: "solid" as const, ...theme.background } : undefined;
    const backgroundImagePath = resolveFileIdToPath(theme.backgroundImage, fileIdToPath);
    return {
        logo: toImageRef(theme.logo, fileManifest, fileIdToPath),
        backgroundImage: backgroundImagePath,
        accentPrimary: theme.accentPrimary,
        background,
        border: theme.border,
        sidebarBackground: theme.sidebarBackground,
        headerBackground: theme.headerBackground,
        cardBackground: theme.cardBackground
    };
}

function mapColorsV3(
    colors: DocsConfig["colorsV3"],
    fileManifest: Record<string, FileManifestEntry> | undefined,
    fileIdToPath: Map<string, string> | undefined
): LedgerConfig["colorsV3"] {
    if (colors == null) {
        return undefined;
    }
    if (colors.type === "dark" || colors.type === "light") {
        return {
            type: colors.type,
            ...mapTheme(colors, fileManifest, fileIdToPath)
        };
    }
    return {
        type: "darkAndLight",
        dark: mapTheme(colors.dark, fileManifest, fileIdToPath),
        light: mapTheme(colors.light, fileManifest, fileIdToPath)
    };
}

function mapMetadata(
    metadata: DocsConfig["metadata"],
    fileIdToPath: Map<string, string> | undefined
): LedgerConfig["metadata"] {
    if (metadata == null) {
        return undefined;
    }
    // Strip image fields and re-add them under PathOrUrl shape.
    const {
        "og:image": ogImage,
        "og:logo": ogLogo,
        "twitter:image": twitterImage,
        "og:background-image": ogBackgroundImage,
        "og:dynamic:background-image": ogDynamicBackgroundImage,
        ...rest
    } = metadata;
    const mapped: Record<string, unknown> = { ...rest };
    const ogImageMapped = toPathOrUrl(ogImage, fileIdToPath);
    if (ogImageMapped != null) {
        mapped["og:image"] = ogImageMapped;
    }
    const ogLogoMapped = toPathOrUrl(ogLogo, fileIdToPath);
    if (ogLogoMapped != null) {
        mapped["og:logo"] = ogLogoMapped;
    }
    const twitterImageMapped = toPathOrUrl(twitterImage, fileIdToPath);
    if (twitterImageMapped != null) {
        mapped["twitter:image"] = twitterImageMapped;
    }
    const ogBackgroundImageMapped = toPathOrUrl(ogBackgroundImage, fileIdToPath);
    if (ogBackgroundImageMapped != null) {
        mapped["og:background-image"] = ogBackgroundImageMapped;
    }
    const ogDynamicBackgroundImageMapped = toPathOrUrl(ogDynamicBackgroundImage, fileIdToPath);
    if (ogDynamicBackgroundImageMapped != null) {
        mapped["og:dynamic:background-image"] = ogDynamicBackgroundImageMapped;
    }
    return mapped as LedgerConfig["metadata"];
}

function mapJsFiles(js: DocsConfig["js"], fileIdToPath: Map<string, string> | undefined): LedgerConfig["js"] {
    if (js == null) {
        return undefined;
    }
    type LedgerJsFile = NonNullable<LedgerConfig["js"]>["files"] extends Array<infer T> | undefined ? T : never;
    const files: LedgerJsFile[] = [];
    for (const file of js.files) {
        const path = resolveFileIdToPath(file.fileId, fileIdToPath);
        if (path == null) {
            continue;
        }
        files.push({ path, strategy: file.strategy });
    }
    return {
        remote: js.remote?.map((r) => ({ url: r.url, strategy: r.strategy })),
        files,
        inline: js.inline
    };
}

function mapTypography(
    typography: DocsConfig["typographyV2"],
    fileIdToPath: Map<string, string> | undefined
): LedgerConfig["typographyV2"] {
    if (typography == null) {
        return undefined;
    }
    const mapFont = <F extends NonNullable<DocsConfig["typographyV2"]>["bodyFont"]>(font: F) => {
        if (font == null) {
            return undefined;
        }
        return {
            type: "custom" as const,
            name: font.name,
            variants: font.variants.map((variant) => ({
                fontFile: resolveFileIdToPath(variant.fontFile, fileIdToPath) ?? variant.fontFile,
                weight: variant.weight,
                style: variant.style
            })),
            display: font.display,
            fallback: font.fallback,
            fontVariationSettings: font.fontVariationSettings
        };
    };
    return {
        headingsFont: mapFont(typography.headingsFont),
        bodyFont: mapFont(typography.bodyFont),
        codeFont: mapFont(typography.codeFont)
    };
}

function mapAgents(agents: DocsConfig["agents"]): LedgerConfig["agents"] {
    if (agents == null) {
        return undefined;
    }
    // llmsTxt / llmsFullTxt are intentionally dropped — the ledger contract
    // serves these well-known files by convention via file artifact lookup
    // (see LedgerConfigSchema doc comment in docs-ledger/contract.ts).
    return {
        pageDirective: agents.pageDirective,
        pageDescriptionSource: agents.pageDescriptionSource,
        siteDescription: agents.siteDescription
    };
}

/**
 * Map a classic DocsConfig (FileId-based) into the ledger-native LedgerConfig
 * (path-based) shape.
 *
 * The two schemas have diverged:
 * - DocsConfig.colorsV3.{dark,light}.logo: FileId  → LedgerConfig: ImageRef { path, width, height }
 * - DocsConfig.colorsV3.{dark,light}.backgroundImage: FileId → LedgerConfig: string (path)
 * - DocsConfig.metadata image fields: FileIdOrUrl → LedgerConfig: PathOrUrl
 * - DocsConfig.js.files[].fileId → LedgerConfig.js.files[].path
 * - DocsConfig.typographyV2.*.variants[].fontFile: FileId → LedgerConfig: string (path)
 *
 * Dimensions for ImageRef come from `fileManifest` (populated by the
 * publishDocs uploadFiles callback using `measureImageSizes`). If an image
 * has no measured dimensions, the corresponding logo field is dropped rather
 * than emitted with placeholder values.
 *
 * Fields that exist only in DocsConfig (favicon, agents.llmsTxt, integrations,
 * languages, navigation, root, logoV2, colors, colorsV2, typography (v1),
 * hideNavLinks, globalTheme, backgroundImage at the top level, logo at the
 * top level) are intentionally omitted: LedgerConfig either exposes them by
 * convention (favicon, llms*) or has dropped them (legacy v1/v2 variants).
 */
export function mapDocsConfigToLedgerConfig({
    docsConfig,
    fileManifest,
    fileIdToPath
}: {
    docsConfig: DocsConfig;
    fileManifest: Record<string, FileManifestEntry> | undefined;
    fileIdToPath: Map<string, string> | undefined;
}): LedgerConfig {
    return {
        title: docsConfig.title,
        defaultLanguage: docsConfig.defaultLanguage,
        translations: docsConfig.translations,
        announcement: docsConfig.announcement,
        navbarLinks: docsConfig.navbarLinks,
        footerLinks: docsConfig.footerLinks,
        logoHeight: docsConfig.logoHeight,
        logoHref: docsConfig.logoHref,
        logoRightText: docsConfig.logoRightText,
        agents: mapAgents(docsConfig.agents),
        metadata: mapMetadata(docsConfig.metadata, fileIdToPath),
        redirects: docsConfig.redirects,
        colorsV3: mapColorsV3(docsConfig.colorsV3, fileManifest, fileIdToPath),
        layout: docsConfig.layout,
        theme: docsConfig.theme,
        settings: docsConfig.settings,
        typographyV2: mapTypography(docsConfig.typographyV2, fileIdToPath),
        analyticsConfig: docsConfig.analyticsConfig,
        css: docsConfig.css,
        js: mapJsFiles(docsConfig.js, fileIdToPath),
        aiChatConfig: docsConfig.aiChatConfig,
        pageActions: docsConfig.pageActions,
        editThisPageLaunch: docsConfig.editThisPageLaunch,
        header: docsConfig.header,
        footer: docsConfig.footer
    };
}
