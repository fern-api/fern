import { docsYml } from "@fern-api/configuration";
import { visitObject, noop } from "@fern-api/core-utils";
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
        loadAPIWorkspace: (id?: string) => AbstractAPIWorkspace<unknown> | undefined;
        context: TaskContext;
    }
}

export async function visitNavigationAst({
    navigation,
    loadAPIWorkspace,
    visitor,
    context
}: visitNavigationAst.Args): Promise<void> {
    if (navigationConfigIsTabbed(navigation)) {
        await Promise.all(
            navigation.map(async (tab) => {
                if (tab.layout != null) {
                    await Promise.all(
                        tab.layout.map(async (item) => {
                            await visitNavigationItem({
                                navigationItem: item,
                                visitor,
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
            navigation.map(async (item) => {
                await visitNavigationItem({
                    navigationItem: item,
                    visitor,
                    loadAPIWorkspace,
                    context
                });
            })
        );
    }
}
async function visitNavigationItem({
    navigationItem,
    visitor,
    loadAPIWorkspace,
    context
}: {
    navigationItem: docsYml.RawSchemas.NavigationItem;
    visitor: Partial<DocsConfigFileAstVisitor>;
    loadAPIWorkspace: (id?: string) => AbstractAPIWorkspace<unknown> | undefined;
    context: TaskContext;
}): Promise<void> {
    await visitObject(navigationItem, {
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
        contents: async (items: docsYml.RawSchemas.NavigationItem[] | undefined): Promise<void> => {
            if (items == null) {
                return;
            }
            items.map(async (item) => {
                await visitNavigationItem({
                    navigationItem: item,
                    visitor,
                    loadAPIWorkspace,
                    context
                });
            });
        },
        viewers: noop,
        orphaned: noop
    });

    if (navigationItemIsApi(navigationItem)) {
        const workspace = loadAPIWorkspace(navigationItem.apiName != null ? navigationItem.apiName : undefined);
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
