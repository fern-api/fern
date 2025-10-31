import { docsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, doesPathExist, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { DocsWorkspace } from "@fern-api/workspace-loader";

export interface IconRef {
    holder: Record<string, unknown>;
    key: string;
    raw: string;
}

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

function pushRef(refs: IconRef[], holder: Record<string, unknown>, key: string = "icon", raw: string | undefined) {
    if (raw != null && shouldProcessIconPath(raw)) {
        refs.push({ holder, key, raw });
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

    /* javascript files */
    if (parsedDocsConfig.js != null) {
        parsedDocsConfig.js.files.forEach((file) => {
            filepaths.add(file.absolutePath);
        });
    }

    return filepaths;
}

export async function collectIconsFromDocsConfig({
    parsedDocsConfig,
    docsWorkspace
}: {
    parsedDocsConfig: docsYml.ParsedDocsConfiguration;
    docsWorkspace: DocsWorkspace;
}): Promise<{ filepaths: Set<AbsoluteFilePath>; refs: IconRef[] }> {
    const refs: IconRef[] = [];
    const filepaths = new Set([
        ...(await collectIconsFromNavigation({
            navigation: parsedDocsConfig.navigation,
            docsWorkspace,
            refs
        })),
        ...(await collectIconsFromNavbarLinks({
            parsedDocsConfig,
            docsWorkspace,
            refs
        }))
    ]);
    return { filepaths, refs };
}

async function collectIconsFromNavbarLinks({
    parsedDocsConfig,
    docsWorkspace,
    refs
}: {
    parsedDocsConfig: docsYml.ParsedDocsConfiguration;
    docsWorkspace: DocsWorkspace;
    refs: IconRef[];
}): Promise<Set<AbsoluteFilePath>> {
    const filepaths = new Set<AbsoluteFilePath>();
    const links = parsedDocsConfig.navbarLinks ?? [];

    const collectIcon = async (holder: Record<string, unknown>, icon: unknown) => {
        if (typeof icon !== "string" || !shouldProcessIconPath(icon)) {
            return;
        }
        pushRef(refs, holder, "icon", icon);
        await addIconToFilepaths({ iconPath: icon, filepaths, docsWorkspace });
    };

    const collectRightIcon = async (holder: Record<string, unknown>, rightIcon: unknown) => {
        if (typeof rightIcon !== "string" || !shouldProcessIconPath(rightIcon)) {
            return;
        }
        pushRef(refs, holder, "rightIcon", rightIcon);
        await addIconToFilepaths({ iconPath: rightIcon, filepaths, docsWorkspace });
    };

    const visit = async (node: unknown): Promise<void> => {
        if (node == null || typeof node !== "object") {
            return;
        }
        const obj = node as Record<string, unknown>;

        await collectIcon(obj, obj.icon);
        await collectRightIcon(obj, obj.rightIcon);

        // biome-ignore lint/suspicious/noExplicitAny: (TODO) need to refine type
        const children = Array.isArray((obj as any).links) ? (obj as any).links : [];
        await Promise.all(children.map(visit));
    };

    await Promise.all(links.map(visit));
    return filepaths;
}

async function collectIconsFromNavigation({
    navigation,
    docsWorkspace,
    refs
}: {
    navigation: docsYml.DocsNavigationConfiguration;
    docsWorkspace: DocsWorkspace;
    refs: IconRef[];
}): Promise<Set<AbsoluteFilePath>> {
    const filepaths = new Set<AbsoluteFilePath>();

    switch (navigation.type) {
        case "untabbed":
            await Promise.all(
                navigation.items.map((item) =>
                    collectIconsFromNavigationItem({
                        item,
                        filepaths,
                        docsWorkspace,
                        refs
                    })
                )
            );
            break;
        case "tabbed":
            await Promise.all(
                navigation.items.map(async (tab) => {
                    if (tab.icon != null) {
                        pushRef(refs, tab as unknown as Record<string, unknown>, "icon", tab.icon);
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
                                    docsWorkspace,
                                    refs
                                })
                            )
                        );
                    } else if (tab.child.type === "variants" && tab.child.variants != null) {
                        await Promise.all(
                            tab.child.variants.flatMap((variant) => {
                                const promises: Promise<void>[] = [];
                                if (variant.icon != null) {
                                    pushRef(refs, variant as unknown as Record<string, unknown>, "icon", variant.icon);
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
                                            docsWorkspace,
                                            refs
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
                            docsWorkspace,
                            refs
                        });
                    }
                    const nestedIcons = await collectIconsFromNavigation({
                        navigation: version.navigation,
                        docsWorkspace,
                        refs
                    });
                    nestedIcons.forEach((filepath) => filepaths.add(filepath));
                })
            );
            break;
        case "productgroup":
            await Promise.all(
                navigation.products.map(async (product) => {
                    if (product.landingPage != null) {
                        await collectIconsFromNavigationItem({
                            item: product.landingPage,
                            filepaths,
                            docsWorkspace,
                            refs
                        });
                    }
                    const nestedIcons = await collectIconsFromNavigation({
                        navigation: product.navigation,
                        docsWorkspace,
                        refs
                    });
                    nestedIcons.forEach((filepath) => filepaths.add(filepath));
                })
            );
            break;
    }

    return filepaths;
}

async function collectIconsFromNavigationItem({
    item,
    filepaths,
    docsWorkspace,
    refs
}: {
    item: docsYml.DocsNavigationItem;
    filepaths: Set<AbsoluteFilePath>;
    docsWorkspace: DocsWorkspace;
    refs: IconRef[];
}): Promise<void> {
    switch (item.type) {
        case "page":
        case "apiSection":
        case "link":
        case "changelog":
            if (item.icon != null) {
                pushRef(refs, item as unknown as Record<string, unknown>, "icon", item.icon);
                await addIconToFilepaths({
                    iconPath: item.icon,
                    filepaths,
                    docsWorkspace
                });
            }
            break;
        case "section":
            if (item.icon != null) {
                pushRef(refs, item as unknown as Record<string, unknown>, "icon", item.icon);
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
                        docsWorkspace,
                        refs
                    })
                )
            );
            break;
    }
}
