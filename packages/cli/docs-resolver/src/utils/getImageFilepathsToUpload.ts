import { docsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, doesPathExist, RelativeFilePath, resolve } from "@fern-api/fs-utils";
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

async function resolvePath({
    pathToImage,
    absolutePathToFernFolder
}: {
    pathToImage: string | undefined;
    absolutePathToFernFolder: AbsoluteFilePath;
}): Promise<AbsoluteFilePath | undefined> {
    if (pathToImage == null || isExternalUrl(pathToImage)) {
        return undefined;
    }

    const filepath = resolve(absolutePathToFernFolder, RelativeFilePath.of(pathToImage));

    if (await doesPathExist(filepath)) {
        return filepath;
    }

    return undefined;
}

async function addIconToFilepaths({
    iconPath,
    filepaths,
    docsWorkspace
}: {
    iconPath: string;
    filepaths: Set<AbsoluteFilePath>;
    docsWorkspace: DocsWorkspace;
}): Promise<void> {
    if (shouldProcessIconPath(iconPath)) {
        const absoluteIconPath = await resolvePath({
            pathToImage: iconPath,
            absolutePathToFernFolder: docsWorkspace.absoluteFilePath
        });

        absoluteIconPath && filepaths.add(absoluteIconPath);
    }
}

export async function collectFilesFromDocsConfig({
    parsedDocsConfig,
    docsWorkspace
}: {
    parsedDocsConfig: docsYml.ParsedDocsConfiguration;
    docsWorkspace: DocsWorkspace;
}): Promise<Set<AbsoluteFilePath>> {
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
    const navigationIcons = await collectIconsFromNavigation({
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

async function collectIconsFromNavigation({
    navigation,
    docsWorkspace
}: {
    navigation: docsYml.DocsNavigationConfiguration;
    docsWorkspace: DocsWorkspace;
}): Promise<Set<AbsoluteFilePath>> {
    const filepaths = new Set<AbsoluteFilePath>();

    switch (navigation.type) {
        case "untabbed":
            await Promise.all(
                navigation.items.map((item) =>
                    collectIconsFromNavigationItem({
                        item,
                        filepaths,
                        docsWorkspace
                    })
                )
            );
            break;
        case "tabbed":
            await Promise.all(
                navigation.items.map(async (tab) => {
                    if (tab.icon != null) {
                        await addIconToFilepaths({
                            iconPath: tab.icon,
                            filepaths,
                            docsWorkspace
                        });
                    }
                    if (tab.child.type === "layout" && tab.child.layout != null) {
                        await Promise.all(
                            tab.child.layout.map((item) =>
                                collectIconsFromNavigationItem({
                                    item,
                                    filepaths,
                                    docsWorkspace
                                })
                            )
                        );
                    } else if (tab.child.type === "variants" && tab.child.variants != null) {
                        await Promise.all(
                            tab.child.variants.flatMap((variant) => {
                                const promises: Promise<void>[] = [];
                                if (variant.icon != null) {
                                    promises.push(
                                        addIconToFilepaths({
                                            iconPath: variant.icon,
                                            filepaths,
                                            docsWorkspace
                                        })
                                    );
                                }
                                promises.push(
                                    ...variant.layout.map((item) =>
                                        collectIconsFromNavigationItem({
                                            item,
                                            filepaths,
                                            docsWorkspace
                                        })
                                    )
                                );
                                return promises;
                            })
                        );
                    }
                })
            );
            break;
        case "versioned":
            await Promise.all(
                navigation.versions.map(async (version) => {
                    if (version.landingPage != null) {
                        await collectIconsFromNavigationItem({
                            item: version.landingPage,
                            filepaths,
                            docsWorkspace
                        });
                    }
                    const nestedIcons = await collectIconsFromNavigation({
                        navigation: version.navigation,
                        docsWorkspace
                    });
                    nestedIcons.forEach((filepath) => filepaths.add(filepath));
                })
            );
            break;
        case "productgroup":
            await Promise.all(
                navigation.products.map(async (product) => {
                    // only internal products have landingPage and navigation
                    if (isInternalProduct(product)) {
                        if (product.landingPage != null) {
                            await collectIconsFromNavigationItem({
                                item: product.landingPage,
                                filepaths,
                                docsWorkspace
                            });
                        }
                        const nestedIcons = await collectIconsFromNavigation({
                            navigation: product.navigation,
                            docsWorkspace
                        });
                        nestedIcons.forEach((filepath) => filepaths.add(filepath));
                    }
                })
            );
            break;
    }

    return filepaths;
}

async function collectIconsFromNavigationItem({
    item,
    filepaths,
    docsWorkspace
}: {
    item: docsYml.DocsNavigationItem;
    filepaths: Set<AbsoluteFilePath>;
    docsWorkspace: DocsWorkspace;
}): Promise<void> {
    switch (item.type) {
        case "page":
            if (item.icon != null) {
                await addIconToFilepaths({
                    iconPath: item.icon,
                    filepaths,
                    docsWorkspace
                });
            }
            break;
        case "section":
            if (item.icon != null) {
                await addIconToFilepaths({
                    iconPath: item.icon,
                    filepaths,
                    docsWorkspace
                });
            }
            await Promise.all(
                item.contents.map((contentItem) =>
                    collectIconsFromNavigationItem({
                        item: contentItem,
                        filepaths,
                        docsWorkspace
                    })
                )
            );
            break;
        case "apiSection":
            if (item.icon != null) {
                await addIconToFilepaths({
                    iconPath: item.icon,
                    filepaths,
                    docsWorkspace
                });
            }
            break;
        case "link":
            if (item.icon != null) {
                await addIconToFilepaths({
                    iconPath: item.icon,
                    filepaths,
                    docsWorkspace
                });
            }
            break;
        case "changelog":
            if (item.icon != null) {
                await addIconToFilepaths({
                    iconPath: item.icon,
                    filepaths,
                    docsWorkspace
                });
            }
            break;
    }
}

function isInternalProduct(product: docsYml.ProductInfo): product is docsYml.InternalProductInfo {
    return "navigation" in product && "landingPage" in product;
}
