import { docsYml } from "@fern-api/configuration-loader";
import { parseImagePaths } from "@fern-api/docs-markdown-utils";
import { AbsoluteFilePath, dirname, doesPathExist, RelativeFilePath, relative, resolve } from "@fern-api/fs-utils";
import { readdir, readFile, stat } from "fs/promises";
import yaml from "js-yaml";
import path from "path";

import { Rule, RuleViolation } from "../../Rule.js";

/**
 * File extensions considered as docs assets (images, fonts, styles, scripts, icons, videos, etc.).
 */
const ASSET_EXTENSIONS = new Set([
    // images
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".webp",
    ".avif",
    ".ico",
    ".tiff",
    ".bmp",
    // videos
    ".mp4",
    ".webm",
    ".mov",
    // fonts
    ".woff",
    ".woff2",
    ".otf",
    ".ttf",
    ".eot",
    // styles
    ".css",
    // scripts
    ".js",
    ".mjs",
    // documents
    ".pdf"
]);

/**
 * Files/directories to always ignore when scanning for on-disk assets.
 */
const IGNORED_NAMES = new Set([
    ".git",
    ".github",
    ".fernignore",
    ".gitignore",
    "node_modules",
    ".DS_Store",
    "Thumbs.db"
]);

/**
 * Recursively collect all asset files under a directory, skipping hidden/dot-prefixed
 * entries and common ignored names.
 */
async function collectAssetFiles(dir: AbsoluteFilePath): Promise<Set<AbsoluteFilePath>> {
    const assets = new Set<AbsoluteFilePath>();

    async function walkDir(currentDir: string): Promise<void> {
        let entries: string[];
        try {
            entries = await readdir(currentDir);
        } catch {
            return;
        }

        for (const entry of entries) {
            // Skip hidden files/dirs (dot-prefixed) and explicitly ignored names
            if (entry.startsWith(".") || IGNORED_NAMES.has(entry)) {
                continue;
            }

            const fullPath = path.join(currentDir, entry);
            let fileStat;
            try {
                fileStat = await stat(fullPath);
            } catch {
                continue;
            }

            if (fileStat.isDirectory()) {
                await walkDir(fullPath);
            } else if (fileStat.isFile()) {
                const ext = path.extname(entry).toLowerCase();
                if (ASSET_EXTENSIONS.has(ext)) {
                    assets.add(AbsoluteFilePath.of(fullPath));
                }
            }
        }
    }

    await walkDir(dir);
    return assets;
}

/**
 * Extract all file paths referenced in the docs configuration and its navigation.
 * This walks the raw config YAML structure to find every local file reference.
 */
async function collectReferencedAssets(
    config: docsYml.RawSchemas.DocsConfiguration,
    configDir: AbsoluteFilePath,
    fernFolder: AbsoluteFilePath
): Promise<Set<AbsoluteFilePath>> {
    const referenced = new Set<AbsoluteFilePath>();

    function addPath(rawPath: string, baseDir: AbsoluteFilePath): void {
        // Skip URLs
        if (rawPath.startsWith("http://") || rawPath.startsWith("https://") || rawPath.startsWith("//")) {
            return;
        }
        const abs = resolve(baseDir, rawPath);
        referenced.add(abs);
    }

    // --- Top-level config fields ---

    // favicon
    if (config.favicon != null) {
        addPath(config.favicon, configDir);
    }

    // logo
    if (config.logo?.dark != null) {
        addPath(config.logo.dark, configDir);
    }
    if (config.logo?.light != null) {
        addPath(config.logo.light, configDir);
    }

    // background-image
    if (config.backgroundImage != null) {
        if (typeof config.backgroundImage === "string") {
            addPath(config.backgroundImage, configDir);
        } else {
            if (config.backgroundImage.dark != null) {
                addPath(config.backgroundImage.dark, configDir);
            }
            if (config.backgroundImage.light != null) {
                addPath(config.backgroundImage.light, configDir);
            }
        }
    }

    // css
    if (config.css != null) {
        const cssEntries = Array.isArray(config.css) ? config.css : [config.css];
        for (const entry of cssEntries) {
            addPath(entry, configDir);
        }
    }

    // js
    if (config.js != null) {
        const jsEntries = Array.isArray(config.js) ? config.js : [config.js];
        for (const entry of jsEntries) {
            if (typeof entry === "string") {
                addPath(entry, configDir);
            } else if ("path" in entry) {
                addPath(entry.path, configDir);
            }
        }
    }

    // footer
    if (config.footer != null && typeof config.footer === "string") {
        addPath(config.footer, configDir);
    }

    // header
    if (config.header != null && typeof config.header === "string") {
        addPath(config.header, configDir);
    }

    // typography fonts
    if (config.typography != null) {
        const fonts = [config.typography.bodyFont, config.typography.codeFont, config.typography.headingsFont];
        for (const font of fonts) {
            if (font == null) {
                continue;
            }
            if (font.path != null) {
                addPath(font.path, configDir);
            }
            for (const p of font.paths ?? []) {
                if (typeof p === "string") {
                    addPath(p, configDir);
                } else {
                    addPath(p.path, configDir);
                }
            }
        }
    }

    // --- Navigation items (pages, sections, folders) ---
    async function walkNavigation(
        navigation: docsYml.RawSchemas.NavigationConfig,
        navConfigDir: AbsoluteFilePath
    ): Promise<void> {
        if (Array.isArray(navigation)) {
            // Check if tabbed
            const isTabbed =
                navigation.length > 0 && (navigation[0] as unknown as Record<string, unknown>)?.tab != null;
            if (isTabbed) {
                for (const tab of navigation as docsYml.RawSchemas.TabbedNavigationConfig) {
                    if ("layout" in tab && Array.isArray(tab.layout)) {
                        for (const item of tab.layout) {
                            await walkNavigationItem(item, navConfigDir);
                        }
                    }
                    if ("variants" in tab && Array.isArray(tab.variants)) {
                        for (const variant of tab.variants) {
                            if (variant.layout != null) {
                                for (const item of variant.layout) {
                                    await walkNavigationItem(item, navConfigDir);
                                }
                            }
                        }
                    }
                }
            } else {
                for (const item of navigation as docsYml.RawSchemas.UntabbedNavigationConfig) {
                    await walkNavigationItem(item, navConfigDir);
                }
            }
        }
    }

    async function walkNavigationItem(
        item: docsYml.RawSchemas.NavigationItem,
        navConfigDir: AbsoluteFilePath
    ): Promise<void> {
        // Page with markdown path
        const pageItem = item as docsYml.RawSchemas.PageConfiguration;
        if (pageItem.page != null && pageItem.path != null) {
            addPath(pageItem.path, navConfigDir);
            await collectImageRefsFromMarkdown(pageItem.path, navConfigDir, fernFolder, referenced);
        }

        // Section with optional path
        const sectionItem = item as docsYml.RawSchemas.SectionConfiguration;
        if (sectionItem.section != null) {
            if (sectionItem.path != null) {
                addPath(sectionItem.path, navConfigDir);
                await collectImageRefsFromMarkdown(sectionItem.path, navConfigDir, fernFolder, referenced);
            }
            if (sectionItem.contents != null) {
                for (const child of sectionItem.contents) {
                    await walkNavigationItem(child, navConfigDir);
                }
            }
        }

        // Changelog directory
        const changelogItem = item as docsYml.RawSchemas.ChangelogConfiguration;
        if (changelogItem.changelog != null) {
            const changelogDir = resolve(navConfigDir, changelogItem.changelog);
            if (await doesPathExist(changelogDir)) {
                try {
                    const files = await readdir(changelogDir);
                    for (const file of files) {
                        if (file.endsWith(".md") || file.endsWith(".mdx")) {
                            const absFile = AbsoluteFilePath.of(path.join(changelogDir, file));
                            referenced.add(absFile);
                            await collectImageRefsFromMarkdownFile(absFile, fernFolder, referenced);
                        }
                    }
                } catch {
                    // ignore read errors
                }
            }
        }

        // API section with openrpc path
        const apiItem = item as docsYml.RawSchemas.ApiReferenceConfiguration;
        if (apiItem.openrpc != null) {
            addPath(apiItem.openrpc, navConfigDir);
        }
    }

    // Walk main navigation
    if (config.navigation != null) {
        await walkNavigation(config.navigation, configDir);
    }

    // Walk versioned navigation
    if (config.versions != null) {
        for (const version of config.versions) {
            addPath(version.path, configDir);
            const versionFilePath = resolve(configDir, version.path);
            if (await doesPathExist(versionFilePath)) {
                try {
                    const content = (await readFile(versionFilePath, "utf8")).toString();
                    const parsed = yaml.load(content) as { navigation?: docsYml.RawSchemas.NavigationConfig };
                    if (parsed?.navigation != null) {
                        await walkNavigation(parsed.navigation, dirname(versionFilePath));
                    }
                } catch {
                    // skip files that can't be parsed
                }
            }
        }
    }

    // Walk product files
    if (config.products != null) {
        for (const product of config.products) {
            if ("path" in product) {
                addPath(product.path, configDir);
                const productFilePath = resolve(configDir, product.path);
                if (await doesPathExist(productFilePath)) {
                    try {
                        const content = (await readFile(productFilePath, "utf8")).toString();
                        const parsed = yaml.load(content) as {
                            navigation?: docsYml.RawSchemas.NavigationConfig;
                        };
                        if (parsed?.navigation != null) {
                            await walkNavigation(parsed.navigation, dirname(productFilePath));
                        }
                    } catch {
                        // skip files that can't be parsed
                    }
                }
            }
        }
    }

    return referenced;
}

/**
 * Parse a markdown file and collect image paths referenced within it.
 */
async function collectImageRefsFromMarkdown(
    markdownPath: string,
    baseDir: AbsoluteFilePath,
    fernFolder: AbsoluteFilePath,
    referenced: Set<AbsoluteFilePath>
): Promise<void> {
    const absPath = resolve(baseDir, markdownPath);
    await collectImageRefsFromMarkdownFile(absPath, fernFolder, referenced);
}

async function collectImageRefsFromMarkdownFile(
    absPath: AbsoluteFilePath,
    fernFolder: AbsoluteFilePath,
    referenced: Set<AbsoluteFilePath>
): Promise<void> {
    if (!(await doesPathExist(absPath))) {
        return;
    }
    try {
        const content = (await readFile(absPath, "utf8")).toString();
        const { filepaths } = parseImagePaths(content, {
            absolutePathToFernFolder: fernFolder,
            absolutePathToMarkdownFile: absPath
        });
        for (const fp of filepaths) {
            referenced.add(fp);
        }
    } catch {
        // ignore parse errors
    }
}

export const UnusedAssetsRule: Rule = {
    name: "unused-assets",
    create: async ({ workspace, logger }) => {
        const fernFolder = workspace.absoluteFilePath;
        const configDir = dirname(workspace.absoluteFilepathToDocsConfig);

        logger.debug("Scanning for on-disk asset files in docs workspace...");
        const allAssets = await collectAssetFiles(fernFolder);
        logger.debug(`Found ${allAssets.size} asset files on disk`);

        logger.debug("Collecting referenced assets from docs configuration...");
        const referencedAssets = await collectReferencedAssets(workspace.config, configDir, fernFolder);
        logger.debug(`Found ${referencedAssets.size} referenced asset paths`);

        // Compute unused = on-disk minus referenced
        const unusedAssets: AbsoluteFilePath[] = [];
        for (const asset of allAssets) {
            if (!referencedAssets.has(asset)) {
                unusedAssets.push(asset);
            }
        }

        // Sort for deterministic output
        unusedAssets.sort();

        logger.debug(`Found ${unusedAssets.length} unused asset files`);

        return {
            file: async () => {
                if (unusedAssets.length === 0) {
                    return [];
                }

                const violations: RuleViolation[] = unusedAssets.map((assetPath) => {
                    const relPath = relative(fernFolder, assetPath);
                    return {
                        severity: "warning" as const,
                        message: `Unused asset file: ${relPath}`,
                        relativeFilepath: RelativeFilePath.of(relPath)
                    };
                });

                return violations;
            }
        };
    }
};
