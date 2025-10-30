import { docsYml } from "@fern-api/configuration-loader";
import { noop, visitObjectAsync } from "@fern-api/core-utils";
import { parseImagePaths } from "@fern-api/docs-markdown-utils";
import { NodePath } from "@fern-api/fern-definition-schema";
import { AbsoluteFilePath, dirname, doesPathExist, relative, resolve } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace } from "@fern-api/workspace-loader";
import { readdir, readFile } from "fs/promises";

import { DocsConfigFileAstVisitor } from "./DocsConfigFileAstVisitor";
import { visitFilepath } from "./visitFilepath";

export declare namespace visitNavigationAst {
    interface Args {
        absolutePathToFernFolder: AbsoluteFilePath;
        navigation: docsYml.RawSchemas.NavigationConfig;
        visitor: Partial<DocsConfigFileAstVisitor>;
        nodePath: NodePath;
        absoluteFilepathToConfiguration: AbsoluteFilePath;
        apiWorkspaces: AbstractAPIWorkspace<unknown>[];
        context: TaskContext;
    }
}

export async function visitNavigationAst({
    absolutePathToFernFolder,
    navigation,
    apiWorkspaces,
    visitor,
    absoluteFilepathToConfiguration,
    context,
    nodePath
}: visitNavigationAst.Args): Promise<void> {
    if (navigationConfigIsTabbed(navigation)) {
        await Promise.all(
            navigation.map(async (tab, tabIdx) => {
                if (tabbedNavigationItemHasLayout(tab)) {
                    await Promise.all(
                        tab.layout.map(async (item: docsYml.RawSchemas.NavigationItem, itemIdx: number) => {
                            await visitNavigationItem({
                                absolutePathToFernFolder,
                                navigationItem: item,
                                visitor,
                                nodePath: [...nodePath, `${tabIdx}`, "layout", `${itemIdx}`],
                                absoluteFilepathToConfiguration,
                                apiWorkspaces,
                                context
                            });
                        })
                    );
                } else if (tabbedNavigationItemHasVariants(tab)) {
                    await Promise.all(
                        tab.variants.flatMap((variant, variantIdx) =>
                            variant.layout.map(async (item: docsYml.RawSchemas.NavigationItem, itemIdx: number) => {
                                await visitNavigationItem({
                                    absolutePathToFernFolder,
                                    navigationItem: item,
                                    visitor,
                                    nodePath: [
                                        ...nodePath,
                                        `${tabIdx}`,
                                        "variants",
                                        `${variantIdx}`,
                                        "layout",
                                        `${itemIdx}`
                                    ],
                                    absoluteFilepathToConfiguration,
                                    apiWorkspaces,
                                    context
                                });
                            })
                        )
                    );
                }
            })
        );
    } else {
        await Promise.all(
            navigation.map(async (item, itemIdx) => {
                await visitNavigationItem({
                    absolutePathToFernFolder,
                    navigationItem: item,
                    visitor,
                    nodePath: [...nodePath, `${itemIdx}`],
                    absoluteFilepathToConfiguration,
                    apiWorkspaces,
                    context
                });
            })
        );
    }
}
async function visitNavigationItem({
    absolutePathToFernFolder,
    navigationItem,
    visitor,
    nodePath,
    absoluteFilepathToConfiguration,
    apiWorkspaces,
    context
}: {
    absolutePathToFernFolder: AbsoluteFilePath;
    navigationItem: docsYml.RawSchemas.NavigationItem;
    visitor: Partial<DocsConfigFileAstVisitor>;
    nodePath: NodePath;
    absoluteFilepathToConfiguration: AbsoluteFilePath;
    apiWorkspaces: AbstractAPIWorkspace<unknown>[];
    context: TaskContext;
}): Promise<void> {
    await visitObjectAsync(navigationItem, {
        alphabetized: noop,
        api: noop,
        apiName: noop,
        audiences: noop,
        openrpc: async (path: string | undefined): Promise<void> => {
            if (path == null) {
                return;
            }

            await visitFilepath({
                absoluteFilepathToConfiguration,
                rawUnresolvedFilepath: path,
                visitor,
                nodePath: [...nodePath, "openrpc"],
                willBeUploaded: false
            });
        },
        displayErrors: noop,
        snippets: noop,
        summary: noop,
        title: noop,
        layout: noop,
        icon: noop,
        slug: noop,
        hidden: noop,
        skipSlug: noop,
        paginated: noop,
        playground: noop,
        flattened: noop,
        featureFlag: noop,
        path: async (path: string | undefined): Promise<void> => {
            if (path == null) {
                return;
            }

            await visitFilepath({
                absoluteFilepathToConfiguration,
                rawUnresolvedFilepath: path,
                visitor,
                nodePath: [...nodePath, "path"],
                willBeUploaded: false
            });
        },
        page: noop,
        contents: async (items: docsYml.RawSchemas.NavigationItem[] | undefined): Promise<void> => {
            if (items == null) {
                return;
            }
            await Promise.all(
                items.map(async (item, idx) => {
                    await visitNavigationItem({
                        absolutePathToFernFolder,
                        navigationItem: item,
                        visitor,
                        nodePath: [...nodePath, "contents", `${idx}`],
                        absoluteFilepathToConfiguration,
                        apiWorkspaces,
                        context
                    });
                })
            );
        },
        viewers: async (viewers: docsYml.RawSchemas.WithPermissions["viewers"]): Promise<void> => {
            if (viewers != null && viewers.length > 0) {
                await visitor.permissions?.({ viewers }, [...nodePath, "viewers"]);
            }
        },
        orphaned: noop,
        availability: noop
    });

    if (navigationItemIsPage(navigationItem)) {
        const absoluteFilepath = resolve(dirname(absoluteFilepathToConfiguration), navigationItem.path);
        if (await doesPathExist(absoluteFilepath)) {
            const content = (await readFile(absoluteFilepath)).toString();
            await visitor.markdownPage?.(
                {
                    title: navigationItem.page,
                    content,
                    absoluteFilepath
                },
                [...nodePath, navigationItem.path]
            );

            try {
                const { filepaths } = parseImagePaths(content, {
                    absolutePathToFernFolder,
                    absolutePathToMarkdownFile: absoluteFilepath
                });

                // visit each media filepath in each markdown file
                for (const filepath of filepaths) {
                    await visitor.filepath?.(
                        {
                            absoluteFilepath: filepath,
                            value: relative(absolutePathToFernFolder, filepath),
                            willBeUploaded: true
                        },
                        [...nodePath, navigationItem.path]
                    );
                }
                // biome-ignore lint/suspicious/noEmptyBlockStatements: allow
            } catch (err) {}
        }
    }

    if (navigationItemIsApi(navigationItem)) {
        const workspace = apiWorkspaces.find((workspace) => workspace.workspaceName === navigationItem.apiName);
        if (workspace != null) {
            await visitor.apiSection?.(
                {
                    config: navigationItem,
                    workspace,
                    context
                },
                [...nodePath, "api"]
            );
        }
    }

    if (navigationItemIsChangelog(navigationItem)) {
        const changelogDir = resolve(dirname(absoluteFilepathToConfiguration), navigationItem.changelog);
        context.logger.trace(`Starting changelog processing for directory: ${changelogDir}`);

        if (await doesPathExist(changelogDir)) {
            const files = await readdir(changelogDir);
            context.logger.trace(`Validating ${files.length} files in changelog directory ${changelogDir}`);

            await Promise.all(
                files
                    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
                    .map(async (file) => {
                        const absoluteFilepath = resolve(changelogDir, file);
                        const content = (await readFile(absoluteFilepath)).toString();
                        context.logger.trace(`Validating markdown file: ${absoluteFilepath}`);

                        await visitor.markdownPage?.(
                            {
                                title: file,
                                content,
                                absoluteFilepath
                            },
                            [...nodePath, "changelog", file]
                        );
                    })
            );
        } else {
            context.logger.trace(`Changelog directory does not exist: ${changelogDir}`);
        }
    }
}

function navigationItemIsChangelog(
    item: docsYml.RawSchemas.NavigationItem
): item is docsYml.RawSchemas.ChangelogConfiguration {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (item as docsYml.RawSchemas.ChangelogConfiguration)?.changelog != null;
}

function navigationItemIsPage(item: docsYml.RawSchemas.NavigationItem): item is docsYml.RawSchemas.PageConfiguration {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (item as docsYml.RawSchemas.PageConfiguration)?.page != null;
}

function navigationItemIsApi(
    item: docsYml.RawSchemas.NavigationItem
): item is docsYml.RawSchemas.ApiReferenceConfiguration {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (item as docsYml.RawSchemas.ApiReferenceConfiguration)?.api != null;
}

function navigationConfigIsTabbed(
    config: docsYml.RawSchemas.NavigationConfig
): config is docsYml.RawSchemas.TabbedNavigationConfig {
    return (config as docsYml.RawSchemas.TabbedNavigationConfig)[0]?.tab != null;
}

function tabbedNavigationItemHasLayout(
    item: docsYml.RawSchemas.TabbedNavigationItem
): item is docsYml.RawSchemas.TabbedNavigationItemWithLayout & {
    layout: docsYml.RawSchemas.NavigationItem[];
} {
    return "layout" in item && Array.isArray(item.layout);
}

function tabbedNavigationItemHasVariants(
    item: docsYml.RawSchemas.TabbedNavigationItem
): item is docsYml.RawSchemas.TabbedNavigationItemWithVariants & {
    variants: docsYml.RawSchemas.TabVariant[];
} {
    return "variants" in item && Array.isArray(item.variants);
}
