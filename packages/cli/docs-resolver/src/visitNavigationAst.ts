import { docsYml } from "@fern-api/configuration-loader";
import { noop, visitObjectAsync } from "@fern-api/core-utils";
import { TaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace, FernWorkspace } from "@fern-api/workspace-loader";

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
        fernWorkspaces: FernWorkspace[];
        context: TaskContext;
    }
}

export async function visitNavigationAst({
    navigation,
    fernWorkspaces,
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
                                fernWorkspaces,
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
                    fernWorkspaces,
                    context
                });
            })
        );
    }
}
async function visitNavigationItem({
    navigationItem,
    visitor,
    fernWorkspaces,
    context
}: {
    navigationItem: docsYml.RawSchemas.NavigationItem;
    visitor: Partial<DocsConfigFileAstVisitor>;
    fernWorkspaces: FernWorkspace[];
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
        contents: async (items: docsYml.RawSchemas.NavigationItem[] | undefined): Promise<void> => {
            if (items == null) {
                return;
            }
            await Promise.all(
                items.map(async (item) => {
                    await visitNavigationItem({
                        navigationItem: item,
                        visitor,
                        fernWorkspaces,
                        context
                    });
                })
            );
        },
        viewers: noop,
        orphaned: noop
    });

    if (navigationItemIsApi(navigationItem)) {
        const workspace = fernWorkspaces.find((workspace) => workspace.workspaceName === navigationItem.apiName);
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
