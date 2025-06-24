import { docsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, RelativeFilePath, doesPathExistSync, resolve } from "@fern-api/fs-utils";
import { DocsWorkspace } from "@fern-api/workspace-loader";

function shouldProcessIconPath(iconPath: string): boolean {
    return (
        iconPath.startsWith(".") || // check for mac + linux relative paths
        iconPath.includes("/") ||
        iconPath.includes("\\") || // check for windows relative paths
        iconPath.includes(":")
    );
}

function isExternalUrl(url: string): boolean {
    return /^(https?:)?\/\//.test(url);
}

function resolvePath({
    pathToImage,
    absolutePathToFernFolder
}: {
    pathToImage: string | undefined;
    absolutePathToFernFolder: AbsoluteFilePath;
}): AbsoluteFilePath | undefined {
    if (pathToImage == null || isExternalUrl(pathToImage)) {
        return undefined;
    }

    const filepath = resolve(absolutePathToFernFolder, RelativeFilePath.of(pathToImage));

    if (doesPathExistSync(filepath)) {
        return filepath;
    }

    return undefined;
}

function addIconToFilepaths({
    iconPath,
    filepaths,
    docsWorkspace
}: {
    iconPath: string;
    filepaths: Set<AbsoluteFilePath>;
    docsWorkspace: DocsWorkspace;
}): void {
    if (shouldProcessIconPath(iconPath)) {
        const absoluteIconPath = resolvePath({
            pathToImage: iconPath,
            absolutePathToFernFolder: docsWorkspace.absoluteFilePath
        });

        absoluteIconPath && filepaths.add(absoluteIconPath);
    }
}

export function collectFilesFromDocsConfig({
    parsedDocsConfig,
    docsWorkspace
}: {
    parsedDocsConfig: docsYml.ParsedDocsConfiguration;
    docsWorkspace: DocsWorkspace;
}): Set<AbsoluteFilePath> {
    const filepaths = new Set<AbsoluteFilePath>();

    /* branding images */
    if (parsedDocsConfig.logo?.dark != null) {
        filepaths.add(parsedDocsConfig.logo.dark);
    }

    if (parsedDocsConfig.logo?.light != null) {
        filepaths.add(parsedDocsConfig.logo.light);
    }

    if (parsedDocsConfig.favicon != null) {
        filepaths.add(parsedDocsConfig.favicon);
    }

    if (parsedDocsConfig.backgroundImage?.dark != null) {
        filepaths.add(parsedDocsConfig.backgroundImage.dark);
    }

    if (parsedDocsConfig.backgroundImage?.light != null) {
        filepaths.add(parsedDocsConfig.backgroundImage.light);
    }

    /* opengraph images */
    if (parsedDocsConfig.metadata?.["og:image"] != null && parsedDocsConfig.metadata["og:image"].type === "filepath") {
        filepaths.add(parsedDocsConfig.metadata["og:image"].value);
    }

    if (parsedDocsConfig.metadata?.["og:logo"] != null && parsedDocsConfig.metadata["og:logo"].type === "filepath") {
        filepaths.add(parsedDocsConfig.metadata["og:logo"].value);
    }

    if (
        parsedDocsConfig.metadata?.["twitter:image"] != null &&
        parsedDocsConfig.metadata["twitter:image"].type === "filepath"
    ) {
        filepaths.add(parsedDocsConfig.metadata["twitter:image"].value);
    }

    /* typography */
    if (parsedDocsConfig.typography?.bodyFont != null) {
        parsedDocsConfig.typography.bodyFont.variants.forEach((variant) => {
            filepaths.add(variant.absolutePath);
        });
    }

    if (parsedDocsConfig.typography?.headingsFont != null) {
        parsedDocsConfig.typography.headingsFont.variants.forEach((variant) => {
            filepaths.add(variant.absolutePath);
        });
    }

    if (parsedDocsConfig.typography?.codeFont != null) {
        parsedDocsConfig.typography.codeFont.variants.forEach((variant) => {
            filepaths.add(variant.absolutePath);
        });
    }

    /* product image files */
    if (parsedDocsConfig.navigation.type === "productgroup") {
        parsedDocsConfig.navigation.products.forEach((product) => {
            if (product.image != null) {
                filepaths.add(product.image);
            }
        });
    }

    /* navigation icons */
    const navigationIcons = collectIconsFromNavigation({
        navigation: parsedDocsConfig.navigation,
        docsWorkspace
    });
    navigationIcons.forEach((filepath) => {
        filepaths.add(filepath);
    });

    /* javascript files */
    if (parsedDocsConfig.js != null) {
        parsedDocsConfig.js.files.forEach((file) => {
            filepaths.add(file.absolutePath);
        });
    }

    return filepaths;
}

function collectIconsFromNavigation({
    navigation,
    docsWorkspace
}: {
    navigation: docsYml.DocsNavigationConfiguration;
    docsWorkspace: DocsWorkspace;
}): Set<AbsoluteFilePath> {
    const filepaths = new Set<AbsoluteFilePath>();

    switch (navigation.type) {
        case "untabbed":
            navigation.items.forEach((item) => {
                collectIconsFromNavigationItem({
                    item,
                    filepaths,
                    docsWorkspace
                });
            });
            break;
        case "tabbed":
            navigation.items.forEach((tab) => {
                if (tab.icon != null) {
                    addIconToFilepaths({
                        iconPath: tab.icon,
                        filepaths,
                        docsWorkspace
                    });
                }
                if (tab.child.type === "layout" && tab.child.layout != null) {
                    tab.child.layout.forEach((item) => {
                        collectIconsFromNavigationItem({
                            item,
                            filepaths,
                            docsWorkspace
                        });
                    });
                }
            });
            break;
        case "versioned":
            navigation.versions.forEach((version) => {
                if (version.landingPage != null) {
                    collectIconsFromNavigationItem({
                        item: version.landingPage,
                        filepaths,
                        docsWorkspace
                    });
                }
                const nestedIcons = collectIconsFromNavigation({
                    navigation: version.navigation,
                    docsWorkspace
                });
                nestedIcons.forEach((filepath) => filepaths.add(filepath));
            });
            break;
        case "productgroup":
            navigation.products.forEach((product) => {
                if (product.landingPage != null) {
                    collectIconsFromNavigationItem({
                        item: product.landingPage,
                        filepaths,
                        docsWorkspace
                    });
                }
                const nestedIcons = collectIconsFromNavigation({
                    navigation: product.navigation,
                    docsWorkspace
                });
                nestedIcons.forEach((filepath) => filepaths.add(filepath));
            });
            break;
    }

    return filepaths;
}

function collectIconsFromNavigationItem({
    item,
    filepaths,
    docsWorkspace
}: {
    item: docsYml.DocsNavigationItem;
    filepaths: Set<AbsoluteFilePath>;
    docsWorkspace: DocsWorkspace;
}): void {
    switch (item.type) {
        case "page":
            if (item.icon != null) {
                addIconToFilepaths({
                    iconPath: item.icon,
                    filepaths,
                    docsWorkspace
                });
            }
            break;
        case "section":
            if (item.icon != null) {
                addIconToFilepaths({
                    iconPath: item.icon,
                    filepaths,
                    docsWorkspace
                });
            }
            item.contents.forEach((contentItem) => {
                collectIconsFromNavigationItem({
                    item: contentItem,
                    filepaths,
                    docsWorkspace
                });
            });
            break;
        case "apiSection":
            if (item.icon != null) {
                addIconToFilepaths({
                    iconPath: item.icon,
                    filepaths,
                    docsWorkspace
                });
            }
            break;
        case "link":
            if (item.icon != null) {
                addIconToFilepaths({
                    iconPath: item.icon,
                    filepaths,
                    docsWorkspace
                });
            }
            break;
        case "changelog":
            if (item.icon != null) {
                addIconToFilepaths({
                    iconPath: item.icon,
                    filepaths,
                    docsWorkspace
                });
            }
            break;
    }
}
