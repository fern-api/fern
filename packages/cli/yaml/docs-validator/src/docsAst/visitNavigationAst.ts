import { docsYml } from "@fern-api/configuration-loader";
import { noop, visitObjectAsync } from "@fern-api/core-utils";
import { parseImagePaths } from "@fern-api/docs-markdown-utils";
import { NodePath } from "@fern-api/fern-definition-schema";
import { AbsoluteFilePath, dirname, doesPathExist, relative, resolve } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace } from "@fern-api/workspace-loader";
import { readdir, readFile, stat } from "fs/promises";
import { asyncPool } from "../utils/asyncPool";
import { DocsConfigFileAstVisitor } from "./DocsConfigFileAstVisitor";
import { visitFilepath } from "./visitFilepath";

const VALIDATION_CONCURRENCY = parseInt(process.env.FERN_DOCS_VALIDATION_CONCURRENCY ?? "32", 10);
const MAX_ASSET_SCAN_BYTES = parseInt(process.env.FERN_DOCS_MAX_ASSET_SCAN_BYTES ?? "5242880", 10);
const PROGRESS_LOG_INTERVAL = 250;

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
    context.logger.debug(`[docs]: Starting navigation validation with concurrency limit: ${VALIDATION_CONCURRENCY}`);

    if (navigationConfigIsTabbed(navigation)) {
        await asyncPool(VALIDATION_CONCURRENCY, navigation, async (tab, tabIdx) => {
            if (tabbedNavigationItemHasLayout(tab)) {
                await asyncPool(
                    VALIDATION_CONCURRENCY,
                    tab.layout,
                    async (item: docsYml.RawSchemas.NavigationItem, itemIdx: number) => {
                        await visitNavigationItem({
                            absolutePathToFernFolder,
                            navigationItem: item,
                            visitor,
                            nodePath: [...nodePath, `${tabIdx}`, "layout", `${itemIdx}`],
                            absoluteFilepathToConfiguration,
                            apiWorkspaces,
                            context
                        });
                    }
                );
            } else if (tabbedNavigationItemHasVariants(tab)) {
                const variantItems = tab.variants.flatMap((variant, variantIdx) =>
                    variant.layout.map((item: docsYml.RawSchemas.NavigationItem, itemIdx: number) => ({
                        item,
                        variantIdx,
                        itemIdx
                    }))
                );
                await asyncPool(VALIDATION_CONCURRENCY, variantItems, async ({ item, variantIdx, itemIdx }) => {
                    await visitNavigationItem({
                        absolutePathToFernFolder,
                        navigationItem: item,
                        visitor,
                        nodePath: [...nodePath, `${tabIdx}`, "variants", `${variantIdx}`, "layout", `${itemIdx}`],
                        absoluteFilepathToConfiguration,
                        apiWorkspaces,
                        context
                    });
                });
            }
        });
    } else {
        await asyncPool(VALIDATION_CONCURRENCY, navigation, async (item, itemIdx) => {
            await visitNavigationItem({
                absolutePathToFernFolder,
                navigationItem: item,
                visitor,
                nodePath: [...nodePath, `${itemIdx}`],
                absoluteFilepathToConfiguration,
                apiWorkspaces,
                context
            });
        });
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
        collapsed: noop,
        icon: noop,
        slug: noop,
        hidden: noop,
        skipSlug: noop,
        paginated: noop,
        playground: noop,
        flattened: noop,
        featureFlag: noop,
        postman: noop,
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
            const fileStats = await stat(absoluteFilepath);
            const fileSizeMB = fileStats.size / (1024 * 1024);

            if (fileSizeMB > 1) {
                context.logger.trace(
                    `[docs]: Processing large markdown file: ${navigationItem.path} (${fileSizeMB.toFixed(2)} MB)`
                );
            }

            const startTime = performance.now();
            const content = (await readFile(absoluteFilepath, "utf8")).toString();
            const readTime = performance.now() - startTime;

            if (readTime > 200) {
                context.logger.debug(`[docs]: Slow file read: ${navigationItem.path} took ${readTime.toFixed(0)}ms`);
            }

            await visitor.markdownPage?.(
                {
                    title: navigationItem.page,
                    content,
                    absoluteFilepath
                },
                [...nodePath, navigationItem.path]
            );

            if (fileStats.size <= MAX_ASSET_SCAN_BYTES) {
                try {
                    const parseStart = performance.now();
                    const { filepaths } = parseImagePaths(content, {
                        absolutePathToFernFolder,
                        absolutePathToMarkdownFile: absoluteFilepath
                    });
                    const parseTime = performance.now() - parseStart;

                    if (parseTime > 2000) {
                        context.logger.debug(
                            `[docs]: Slow image path parsing: ${navigationItem.path} took ${parseTime.toFixed(0)}ms`
                        );
                    }

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
                } catch (err) {
                    context.logger.trace(`[docs]: Failed to parse image paths in ${navigationItem.path}: ${err}`);
                }
            } else {
                context.logger.debug(
                    `[docs]: Skipping asset scan for large file: ${navigationItem.path} (${fileSizeMB.toFixed(2)} MB > ${(MAX_ASSET_SCAN_BYTES / (1024 * 1024)).toFixed(2)} MB). Set FERN_DOCS_MAX_ASSET_SCAN_BYTES to override.`
                );
            }
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
        context.logger.trace(`[docs]: Starting changelog processing for directory: ${changelogDir}`);

        if (await doesPathExist(changelogDir)) {
            const startTime = performance.now();
            const files = await readdir(changelogDir);
            const markdownFiles = files.filter((file) => file.endsWith(".md") || file.endsWith(".mdx"));
            context.logger.debug(`[docs]: Processing ${markdownFiles.length} changelog files in ${changelogDir}`);

            await asyncPool(VALIDATION_CONCURRENCY, markdownFiles, async (file) => {
                const absoluteFilepath = resolve(changelogDir, file);
                const content = (await readFile(absoluteFilepath, "utf8")).toString();
                context.logger.trace(`[docs]: Validating changelog file: ${file}`);

                await visitor.markdownPage?.(
                    {
                        title: file,
                        content,
                        absoluteFilepath
                    },
                    [...nodePath, "changelog", file]
                );
            });

            const elapsedTime = performance.now() - startTime;
            context.logger.debug(
                `[docs]: Finished processing ${markdownFiles.length} changelog files in ${elapsedTime.toFixed(0)}ms`
            );
        } else {
            context.logger.trace(`[docs]: Changelog directory does not exist: ${changelogDir}`);
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
