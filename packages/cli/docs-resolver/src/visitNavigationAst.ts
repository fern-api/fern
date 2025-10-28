import { docsYml } from "@fern-api/configuration-loader";
import { noop, visitObjectAsync } from "@fern-api/core-utils";
import { TaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace } from "@fern-api/workspace-loader";

export type DocsConfigFileAstVisitor<R = void | Promise<void>> = {
    [K in keyof DocsConfigFileAstNodeTypes]: DocsConfigFileAstNodeVisitor<K, R>;
};

export interface DocsConfigFileAstNodeTypes {
    apiSection: {
        config: docsYml.RawSchemas.ApiReferenceConfiguration;
        workspace: AbstractAPIWorkspace<unknown>;
        context: TaskContext;
    };
}

export type DocsConfigFileAstNodeVisitor<K extends keyof DocsConfigFileAstNodeTypes, R = void | Promise<void>> = (
    node: DocsConfigFileAstNodeTypes[K]
) => R;

export declare namespace visitNavigationAst {
    interface Args {
        navigation: docsYml.RawSchemas.NavigationConfig;
        visitor: Partial<DocsConfigFileAstVisitor>;
        apiWorkspaces: AbstractAPIWorkspace<unknown>[];
        context: TaskContext;
    }
}

export async function visitNavigationAst({
    navigation,
    apiWorkspaces,
    visitor,
    context
}: visitNavigationAst.Args): Promise<void> {
    if (navigationConfigIsTabbed(navigation)) {
        await Promise.all(
            navigation.map(async (tab) => {
                if ("layout" in tab && tab.layout != null) {
                    await Promise.all(
                        tab.layout.map(async (item: docsYml.RawSchemas.NavigationItem) => {
                            await visitNavigationItem({
                                navigationItem: item,
                                visitor,
                                apiWorkspaces,
                                context
                            });
                        })
                    );
                } else if ("variants" in tab && tab.variants != null) {
                    await Promise.all(
                        tab.variants.flatMap((variant) =>
                            variant.layout.map(async (item: docsYml.RawSchemas.NavigationItem) => {
                                await visitNavigationItem({
                                    navigationItem: item,
                                    visitor,
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
            navigation.map(async (item) => {
                await visitNavigationItem({
                    navigationItem: item,
                    visitor,
                    apiWorkspaces,
                    context
                });
            })
        );
    }
}
async function visitNavigationItem({
    navigationItem,
    visitor,
    apiWorkspaces,
    context
}: {
    navigationItem: docsYml.RawSchemas.NavigationItem;
    visitor: Partial<DocsConfigFileAstVisitor>;
    apiWorkspaces: AbstractAPIWorkspace<unknown>[];
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
        path: noop,
        page: noop,
        featureFlag: noop,
        openrpc: noop,
        contents: async (items: docsYml.RawSchemas.NavigationItem[] | undefined): Promise<void> => {
            if (items == null) {
                return;
            }
            await Promise.all(
                items.map(async (item) => {
                    await visitNavigationItem({
                        navigationItem: item,
                        visitor,
                        apiWorkspaces,
                        context
                    });
                })
            );
        },
        viewers: noop,
        orphaned: noop,
        availability: noop
    });

    if (navigationItemIsApi(navigationItem)) {
        const workspace = apiWorkspaces.find((workspace) => workspace.workspaceName === navigationItem.apiName);
        if (workspace != null) {
            await visitor.apiSection?.({
                config: navigationItem,
                workspace,
                context
            });
        }
    }
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
