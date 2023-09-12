import { AbsoluteFilePath, dirname, doesPathExist, resolve } from "@fern-api/fs-utils";
import {
    DocsConfiguration,
    NavigationConfig,
    NavigationItem,
    PageConfiguration,
    SectionConfiguration,
    TabbedNavigationConfig,
} from "@fern-fern/docs-config/api";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { NodePath } from "../NodePath";
import { DocsConfigFileAstVisitor } from "./DocsConfigFileAstVisitor";
import { validateVersionConfigFileSchema } from "./validateVersionConfig";

export async function visitDocsConfigFileYamlAst(
    contents: DocsConfiguration,
    visitor: Partial<DocsConfigFileAstVisitor>,
    absoluteFilepathToConfiguration: AbsoluteFilePath
): Promise<void> {
    await visitor.file?.(
        {
            config: contents,
        },
        []
    );

    if (contents.backgroundImage != null) {
        await visitFilepath({
            absoluteFilepathToConfiguration,
            rawUnresolvedFilepath: contents.backgroundImage,
            visitor,
            nodePath: ["background-image"],
        });
    }
    if (contents.favicon != null) {
        await visitFilepath({
            absoluteFilepathToConfiguration,
            rawUnresolvedFilepath: contents.favicon,
            visitor,
            nodePath: ["favicon"],
        });
    }
    if (contents.logo?.dark != null) {
        await visitFilepath({
            absoluteFilepathToConfiguration,
            rawUnresolvedFilepath: contents.logo.dark,
            visitor,
            nodePath: ["logo", "dark"],
        });
    }
    if (contents.logo?.light != null) {
        await visitFilepath({
            absoluteFilepathToConfiguration,
            rawUnresolvedFilepath: contents.logo.light,
            visitor,
            nodePath: ["logo", "light"],
        });
    }

    if (contents.navigation != null) {
        await visitNavigation({
            navigation: contents.navigation,
            visitor,
            nodePath: ["navigation"],
            absoluteFilepathToConfiguration,
        });
    }

    if (contents.typography?.codeFont != null) {
        await visitFilepath({
            absoluteFilepathToConfiguration,
            rawUnresolvedFilepath: contents.typography.codeFont.path,
            visitor,
            nodePath: ["typography", "codeFont"],
        });
    }
    if (contents.typography?.bodyFont != null) {
        await visitFilepath({
            absoluteFilepathToConfiguration,
            rawUnresolvedFilepath: contents.typography.bodyFont.path,
            visitor,
            nodePath: ["typography", "codeFont"],
        });
    }
    if (contents.typography?.headingsFont != null) {
        await visitFilepath({
            absoluteFilepathToConfiguration,
            rawUnresolvedFilepath: contents.typography.headingsFont.path,
            visitor,
            nodePath: ["typography", "codeFont"],
        });
    }

    if (contents.versions != null) {
        await Promise.all(
            contents.versions.map(async (version, idx) => {
                await visitFilepath({
                    absoluteFilepathToConfiguration,
                    rawUnresolvedFilepath: version.path,
                    visitor,
                    nodePath: ["versions", `${0}`],
                });
                const absoluteFilepath = resolve(dirname(absoluteFilepathToConfiguration), version.path);
                const content = yaml.load((await readFile(absoluteFilepath)).toString());
                if (await doesPathExist(absoluteFilepath)) {
                    await visitor.versionFile?.(
                        {
                            path: version.path,
                            content,
                        },
                        [version.path]
                    );
                }
                const parsedVersionFile = await validateVersionConfigFileSchema({ value: content });
                if (parsedVersionFile.type === "success") {
                    await visitNavigation({
                        navigation: parsedVersionFile.contents.navigation,
                        visitor,
                        nodePath: ["navigation"],
                        absoluteFilepathToConfiguration: absoluteFilepath,
                    });
                }
            })
        );
    }
}

async function visitFilepath({
    absoluteFilepathToConfiguration,
    rawUnresolvedFilepath,
    visitor,
    nodePath,
}: {
    absoluteFilepathToConfiguration: AbsoluteFilePath;
    rawUnresolvedFilepath: string;
    visitor: Partial<DocsConfigFileAstVisitor>;
    nodePath: NodePath;
}) {
    const absoluteFilepath = resolve(dirname(absoluteFilepathToConfiguration), rawUnresolvedFilepath);
    await visitor.filepath?.(
        {
            absoluteFilepath,
            value: rawUnresolvedFilepath,
        },
        nodePath
    );
}

async function visitNavigation({
    navigation,
    visitor,
    nodePath,
    absoluteFilepathToConfiguration,
}: {
    navigation: NavigationConfig;
    visitor: Partial<DocsConfigFileAstVisitor>;
    nodePath: NodePath;
    absoluteFilepathToConfiguration: AbsoluteFilePath;
}): Promise<void> {
    if (navigationConfigIsTabbed(navigation)) {
        await Promise.all(
            navigation.map(async (tab, tabIdx) => {
                await Promise.all(
                    tab.layout.map(async (item, itemIdx) => {
                        await visitNavigationItem({
                            navigationItem: item,
                            visitor,
                            nodePath: [...nodePath, `${tabIdx}`, "layout", `${itemIdx}`],
                            absoluteFilepathToConfiguration,
                        });
                    })
                );
            })
        );
    } else {
        await Promise.all(
            navigation.map(async (item, itemIdx) => {
                await visitNavigationItem({
                    navigationItem: item,
                    visitor,
                    nodePath: [...nodePath, `${itemIdx}`],
                    absoluteFilepathToConfiguration,
                });
            })
        );
    }
}

async function visitNavigationItem({
    navigationItem,
    visitor,
    nodePath,
    absoluteFilepathToConfiguration,
}: {
    navigationItem: NavigationItem;
    visitor: Partial<DocsConfigFileAstVisitor>;
    nodePath: NodePath;
    absoluteFilepathToConfiguration: AbsoluteFilePath;
}): Promise<void> {
    if (navigationItemIsPage(navigationItem)) {
        await visitFilepath({
            absoluteFilepathToConfiguration,
            rawUnresolvedFilepath: navigationItem.path,
            visitor,
            nodePath: [...nodePath, "page"],
        });
        const absoluteFilepath = resolve(dirname(absoluteFilepathToConfiguration), navigationItem.path);
        if (await doesPathExist(absoluteFilepath)) {
            await visitor.markdownPage?.(
                {
                    title: navigationItem.page,
                    content: (await readFile(absoluteFilepath)).toString(),
                },
                [...nodePath, "page", navigationItem.path]
            );
        }
    }

    if (navigationItemIsSection(navigationItem)) {
        await Promise.all(
            navigationItem.contents.map(async (item, itemIdx) => {
                await visitNavigationItem({
                    navigationItem: item,
                    visitor,
                    nodePath: [...nodePath, "section", "contents", `${itemIdx}`],
                    absoluteFilepathToConfiguration,
                });
            })
        );
    }
}

function navigationItemIsPage(item: NavigationItem): item is PageConfiguration {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (item as PageConfiguration).page != null;
}

function navigationItemIsSection(item: NavigationItem): item is SectionConfiguration {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (item as SectionConfiguration).section != null;
}

function navigationConfigIsTabbed(config: NavigationConfig): config is TabbedNavigationConfig {
    return (config as TabbedNavigationConfig)[0]?.tab != null;
}
