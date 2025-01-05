import { readFile } from "fs/promises";

import { docsYml } from "@fern-api/configuration-loader";
import { noop, visitObjectAsync } from "@fern-api/core-utils";
import { parseImagePaths } from "@fern-api/docs-markdown-utils";
import { NodePath } from "@fern-api/fern-definition-schema";
import { AbsoluteFilePath, dirname, doesPathExist, relative, resolve } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { APIWorkspaceLoader } from "./APIWorkspaceLoader";
import { DocsConfigFileAstVisitor } from "./DocsConfigFileAstVisitor";
import { visitFilepath } from "./visitFilepath";

export declare namespace visitNavigationAst {
    interface Args {
        absolutePathToFernFolder: AbsoluteFilePath;
        navigation: docsYml.RawSchemas.NavigationConfig;
        visitor: Partial<DocsConfigFileAstVisitor>;
        nodePath: NodePath;
        absoluteFilepathToConfiguration: AbsoluteFilePath;
        loadAPIWorkspace: APIWorkspaceLoader;
        context: TaskContext;
    }
}

export async function visitNavigationAst({
    absolutePathToFernFolder,
    navigation,
    loadAPIWorkspace,
    visitor,
    absoluteFilepathToConfiguration,
    context,
    nodePath
}: visitNavigationAst.Args): Promise<void> {
    if (navigationConfigIsTabbed(navigation)) {
        await Promise.all(
            navigation.map(async (tab, tabIdx) => {
                if (tab.layout != null) {
                    await Promise.all(
                        tab.layout.map(async (item, itemIdx) => {
                            await visitNavigationItem({
                                absolutePathToFernFolder,
                                navigationItem: item,
                                visitor,
                                nodePath: [...nodePath, `${tabIdx}`, "layout", `${itemIdx}`],
                                absoluteFilepathToConfiguration,
                                loadAPIWorkspace,
                                context
                            });
                        })
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
                    loadAPIWorkspace,
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
    loadAPIWorkspace,
    context
}: {
    absolutePathToFernFolder: AbsoluteFilePath;
    navigationItem: docsYml.RawSchemas.NavigationItem;
    visitor: Partial<DocsConfigFileAstVisitor>;
    nodePath: NodePath;
    absoluteFilepathToConfiguration: AbsoluteFilePath;
    loadAPIWorkspace: APIWorkspaceLoader;
    context: TaskContext;
}): Promise<void> {
    await visitObjectAsync(navigationItem, {
        alphabetized: noop,
        api: noop,
        apiName: noop,
        audiences: noop,
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
                        loadAPIWorkspace,
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
        orphaned: noop
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
                    absolutePathToMdx: absoluteFilepath
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
            } catch (err) {}
        }
    }

    if (navigationItemIsApi(navigationItem)) {
        const workspace = loadAPIWorkspace(navigationItem.apiName != null ? navigationItem.apiName : undefined);
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
}

function navigationItemIsPage(item: docsYml.RawSchemas.NavigationItem): item is docsYml.RawSchemas.PageConfiguration {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (item as docsYml.RawSchemas.PageConfiguration).page != null;
}

function navigationItemIsApi(
    item: docsYml.RawSchemas.NavigationItem
): item is docsYml.RawSchemas.ApiReferenceConfiguration {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (item as docsYml.RawSchemas.ApiReferenceConfiguration).api != null;
}

function navigationConfigIsTabbed(
    config: docsYml.RawSchemas.NavigationConfig
): config is docsYml.RawSchemas.TabbedNavigationConfig {
    return (config as docsYml.RawSchemas.TabbedNavigationConfig)[0]?.tab != null;
}
