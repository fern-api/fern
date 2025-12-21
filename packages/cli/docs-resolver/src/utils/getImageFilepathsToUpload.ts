import { docsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import path from "path";

function addIconPathToFilepaths({
    iconPath,
    filepaths
}: {
    iconPath: string | AbsoluteFilePath | undefined;
    filepaths: Set<AbsoluteFilePath>;
}): void {
    if (iconPath == null) {
        return;
    }

    if (typeof iconPath === "string" && path.isAbsolute(iconPath)) {
        filepaths.add(iconPath as AbsoluteFilePath);
    }
}

async function addThemedIconToFilepaths({
    themedIcon,
    filepaths
}: {
    themedIcon: docsYml.ThemedIcon | undefined;
    filepaths: Set<AbsoluteFilePath>;
}): Promise<void> {
    if (themedIcon == null) {
        return;
    }

    addIconPathToFilepaths({ iconPath: themedIcon.dark, filepaths });
    addIconPathToFilepaths({ iconPath: themedIcon.light, filepaths });
}

function addThemedImageToFilepaths({
    themedImage,
    filepaths
}: {
    themedImage: docsYml.ThemedImage | undefined;
    filepaths: Set<AbsoluteFilePath>;
}): void {
    if (themedImage == null) {
        return;
    }

    if (themedImage.dark != null) {
        filepaths.add(themedImage.dark);
    }
    if (themedImage.light != null) {
        filepaths.add(themedImage.light);
    }
}

export async function collectFilesFromDocsConfig({
    parsedDocsConfig
}: {
    parsedDocsConfig: docsYml.ParsedDocsConfiguration;
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
            addThemedImageToFilepaths({ themedImage: product.image, filepaths });
        });
    }

    /* navigation icons */
    const navigationIcons = await collectIconsFromNavigation({
        navigation: parsedDocsConfig.navigation
    });
    navigationIcons.forEach((filepath) => {
        filepaths.add(filepath);
    });

    /* navbar links */
    if (parsedDocsConfig.navbarLinks) {
        await Promise.all(
            parsedDocsConfig.navbarLinks.map(async (link) => {
                if (link.type === "dropdown") {
                    link.links.map(async (nestedLink) => {
                        if (nestedLink.icon) {
                            addIconPathToFilepaths({
                                iconPath: nestedLink.icon,
                                filepaths
                            });
                        }

                        if (nestedLink.rightIcon) {
                            addIconPathToFilepaths({
                                iconPath: nestedLink.rightIcon,
                                filepaths
                            });
                        }
                    });
                }

                if (link.type !== "github") {
                    if (link.icon) {
                        addIconPathToFilepaths({
                            iconPath: link.icon,
                            filepaths
                        });
                    }

                    if (link.rightIcon) {
                        addIconPathToFilepaths({
                            iconPath: link.rightIcon,
                            filepaths
                        });
                    }
                }
            })
        );
    }

    /* javascript files */
    if (parsedDocsConfig.js != null) {
        parsedDocsConfig.js.files.forEach((file) => {
            filepaths.add(file.absolutePath);
        });
    }

    /* custom page action icons */
    if (parsedDocsConfig.pageActions?.options?.custom != null) {
        await Promise.all(
            parsedDocsConfig.pageActions.options.custom.map(async (customAction) => {
                await addThemedIconToFilepaths({
                    themedIcon: customAction.icon,
                    filepaths
                });
            })
        );
    }

    return filepaths;
}

async function collectIconsFromNavigation({
    navigation
}: {
    navigation: docsYml.DocsNavigationConfiguration;
}): Promise<Set<AbsoluteFilePath>> {
    const filepaths = new Set<AbsoluteFilePath>();

    switch (navigation.type) {
        case "untabbed":
            await Promise.all(
                navigation.items.map((item) =>
                    collectIconsFromNavigationItem({
                        item,
                        filepaths
                    })
                )
            );
            break;
        case "tabbed":
            await Promise.all(
                navigation.items.map(async (tab) => {
                    await addThemedIconToFilepaths({
                        themedIcon: tab.icon,
                        filepaths
                    });
                    if (tab.child.type === "layout" && tab.child.layout != null) {
                        await Promise.all(
                            tab.child.layout.map((item) =>
                                collectIconsFromNavigationItem({
                                    item,
                                    filepaths
                                })
                            )
                        );
                    } else if (tab.child.type === "variants" && tab.child.variants != null) {
                        await Promise.all(
                            tab.child.variants.flatMap((variant) => {
                                const promises: Promise<void>[] = [];
                                promises.push(
                                    addThemedIconToFilepaths({
                                        themedIcon: variant.icon,
                                        filepaths
                                    })
                                );
                                promises.push(
                                    ...variant.layout.map((item) =>
                                        collectIconsFromNavigationItem({
                                            item,
                                            filepaths
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
                            filepaths
                        });
                    }
                    const nestedIcons = await collectIconsFromNavigation({
                        navigation: version.navigation
                    });
                    nestedIcons.forEach((filepath) => filepaths.add(filepath));
                })
            );
            break;
        case "productgroup":
            await Promise.all(
                navigation.products.map(async (product) => {
                    await addThemedIconToFilepaths({
                        themedIcon: product.icon,
                        filepaths
                    });
                    if (product.type === "internal") {
                        if (product.landingPage != null) {
                            await collectIconsFromNavigationItem({
                                item: product.landingPage,
                                filepaths
                            });
                        }

                        const nestedIcons = await collectIconsFromNavigation({
                            navigation: product.navigation
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
    filepaths
}: {
    item: docsYml.DocsNavigationItem;
    filepaths: Set<AbsoluteFilePath>;
}): Promise<void> {
    switch (item.type) {
        case "page":
            await addThemedIconToFilepaths({
                themedIcon: item.icon,
                filepaths
            });
            break;
        case "section":
            await addThemedIconToFilepaths({
                themedIcon: item.icon,
                filepaths
            });
            await Promise.all(
                item.contents.map((contentItem) =>
                    collectIconsFromNavigationItem({
                        item: contentItem,
                        filepaths
                    })
                )
            );
            break;
        case "apiSection":
            await addThemedIconToFilepaths({
                themedIcon: item.icon,
                filepaths
            });
            break;
        case "link":
            await addThemedIconToFilepaths({
                themedIcon: item.icon,
                filepaths
            });
            break;
        case "changelog":
            await addThemedIconToFilepaths({
                themedIcon: item.icon,
                filepaths
            });
            break;
    }
}
