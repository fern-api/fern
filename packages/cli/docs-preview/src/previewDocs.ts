import { docsYml } from "@fern-api/configuration";
import { assertNever, entries } from "@fern-api/core-utils";
import {
    APIV1Read,
    convertAPIDefinitionToDb,
    convertDbAPIDefinitionToRead,
    convertDbDocsConfigToRead,
    convertDocsDefinitionToDb,
    DocsV1Read,
    DocsV1Write,
    FdrAPI,
    SDKSnippetHolder
} from "@fern-api/fdr-sdk";
import { dirname, relative } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { convertIrToFdrApi } from "@fern-api/register";
import { TaskContext } from "@fern-api/task-context";
import { APIWorkspace, convertOpenApiWorkspaceToFernWorkspace, DocsWorkspace } from "@fern-api/workspace-loader";
import { v4 as uuidv4 } from "uuid";

export async function getPreviewDocsDefinition({
    docsWorkspace,
    apiWorkspaces,
    context
}: {
    docsWorkspace: DocsWorkspace;
    apiWorkspaces: APIWorkspace[];
    context: TaskContext;
}): Promise<DocsV1Read.DocsDefinition> {
    const parsedDocsConfig = await docsYml.parseDocsConfiguration({
        rawDocsConfiguration: docsWorkspace.config,
        context,
        absolutePathToFernFolder: docsWorkspace.absoluteFilepath,
        absoluteFilepathToDocsConfig: docsWorkspace.absoluteFilepathToDocsConfig
    });
    const apiCollector = new ReferencedAPICollector(apiWorkspaces, context);
    const writeDocsDefinition = await constructWriteDocsDefinition({
        parsedDocsConfig,
        context,
        apiCollector
    });
    const dbDocsDefinition = convertDocsDefinitionToDb({
        writeShape: writeDocsDefinition,
        files: {}
    });
    const readDocsConfig = convertDbDocsConfigToRead({
        dbShape: dbDocsDefinition.config
    });
    return {
        apis: await apiCollector.getAPIsForDefinition(),
        config: readDocsConfig,
        files: {},
        filesV2: {},
        pages: dbDocsDefinition.pages,
        search: {
            type: "legacyMultiAlgoliaIndex",
            algoliaIndex: "fake"
        }
    };
}

type APIDefinitionID = string;

class ReferencedAPICollector {
    private readonly apis: Record<APIDefinitionID, docsYml.DocsNavigationItem.ApiSection> = {};

    constructor(private readonly apiWorkspaces: APIWorkspace[], private readonly context: TaskContext) {}

    public addReferencedAPI(api: docsYml.DocsNavigationItem.ApiSection): APIDefinitionID {
        const id = uuidv4();
        this.apis[id] = api;
        return id;
    }

    public async getAPIsForDefinition(): Promise<Promise<Record<FdrAPI.ApiDefinitionId, APIV1Read.ApiDefinition>>> {
        const result: Record<FdrAPI.ApiDefinitionId, APIV1Read.ApiDefinition> = {};
        for (const [id, api] of Object.entries(this.apis)) {
            let workspace = this.apiWorkspaces[0];
            if (api.apiName != null) {
                workspace = this.apiWorkspaces.find((workspace) => workspace.workspaceName);
            }
            if (workspace == null) {
                this.context.logger.error(`Failed to load API workspace ${api.apiName}`);
                continue;
            }
            const fernWorkspace =
                workspace.type === "oss"
                    ? await convertOpenApiWorkspaceToFernWorkspace(workspace, this.context)
                    : workspace;
            const ir = await generateIntermediateRepresentation({
                workspace: fernWorkspace,
                audiences: api.audiences,
                generationLanguage: undefined,
                smartCasing: false,
                disableExamples: false
            });
            const apiDefinition = convertIrToFdrApi({
                ir,
                snippetsConfig: {}
            });
            const dbApiDefinition = convertAPIDefinitionToDb(
                apiDefinition,
                "",
                new SDKSnippetHolder({
                    snippetsConfigWithSdkId: {},
                    snippetsBySdkId: {},
                    snippetTemplatesByEndpoint: {},
                    snippetTemplatesByEndpointId: {},
                    snippetsBySdkIdAndEndpointId: {}
                })
            );
            const readApiDefinition = convertDbAPIDefinitionToRead(dbApiDefinition);
            result[id] = readApiDefinition;
        }
        return result;
    }
}

async function constructWriteDocsDefinition({
    parsedDocsConfig,
    context,
    apiCollector
}: {
    parsedDocsConfig: docsYml.ParsedDocsConfiguration;
    context: TaskContext;
    apiCollector: ReferencedAPICollector;
}): Promise<DocsV1Write.DocsDefinition> {
    return {
        pages: entries(parsedDocsConfig.pages).reduce(
            (pages, [pageFilepath, pageContents]) => ({
                ...pages,
                [pageFilepath]: { markdown: pageContents }
            }),
            {}
        ),
        config: await convertDocsConfiguration({
            parsedDocsConfig,
            context,
            apiCollector
        })
    };
}

async function convertDocsConfiguration({
    parsedDocsConfig,
    context,
    apiCollector
}: {
    parsedDocsConfig: docsYml.ParsedDocsConfiguration;
    context: TaskContext;
    apiCollector: ReferencedAPICollector;
}): Promise<DocsV1Write.DocsConfig> {
    return {
        title: parsedDocsConfig.title,
        logoV2: undefined,
        logoHeight: undefined,
        logoHref: undefined,
        favicon: undefined,
        backgroundImage: undefined,
        navigation: await convertNavigationConfig({
            navigationConfig: parsedDocsConfig.navigation,
            tabs: parsedDocsConfig.tabs,
            parsedDocsConfig,
            context,
            apiCollector
        }),
        colorsV3: parsedDocsConfig.colors,
        navbarLinks: parsedDocsConfig.navbarLinks,
        typography: undefined
    };
}

async function convertNavigationConfig({
    navigationConfig,
    tabs,
    parsedDocsConfig,
    context,
    apiCollector
}: {
    navigationConfig: docsYml.DocsNavigationConfiguration;
    tabs?: Record<string, docsYml.RawSchemas.TabConfig>;
    parsedDocsConfig: docsYml.ParsedDocsConfiguration;
    context: TaskContext;
    apiCollector: ReferencedAPICollector;
}): Promise<DocsV1Write.NavigationConfig> {
    switch (navigationConfig.type) {
        case "untabbed":
            return {
                items: await Promise.all(
                    navigationConfig.items.map((item) =>
                        convertNavigationItem({
                            item,
                            parsedDocsConfig,
                            context,
                            apiCollector
                        })
                    )
                )
            };
        case "tabbed":
            return {
                tabs: await convertTabbedNavigation(navigationConfig.items, {
                    tabs,
                    parsedDocsConfig,
                    context,
                    apiCollector
                })
            };
        case "versioned":
            return {
                versions: await Promise.all(
                    navigationConfig.versions.map(
                        async (version): Promise<DocsV1Write.VersionedNavigationConfigData> => {
                            return {
                                version: version.version,
                                config: await convertUnversionedNavigationConfig({
                                    navigationConfig: version.navigation,
                                    parsedDocsConfig,
                                    context,
                                    version: version.version,
                                    apiCollector
                                }),
                                availability:
                                    version.availability != null
                                        ? convertAvailability(version.availability)
                                        : undefined,
                                urlSlugOverride: version.slug
                            };
                        }
                    )
                )
            };
        default:
            assertNever(navigationConfig);
    }
}

function convertTabbedNavigation(
    items: docsYml.TabbedNavigation[],
    {
        tabs,
        parsedDocsConfig,
        context,
        apiCollector
    }: {
        tabs?: Record<string, docsYml.RawSchemas.TabConfig>;
        parsedDocsConfig: docsYml.ParsedDocsConfiguration;
        context: TaskContext;
        apiCollector: ReferencedAPICollector;
    }
): Promise<DocsV1Write.NavigationTab[]> {
    return Promise.all(
        items.map(async (tabbedItem) => {
            const tabConfig = tabs?.[tabbedItem.tab];
            if (tabConfig == null) {
                throw new Error(`Couldn't find config for tab id ${tabbedItem.tab}`);
            }

            if (tabConfig.href != null) {
                if (tabbedItem.layout != null) {
                    throw new Error(
                        `Tab ${tabConfig.displayName} contains an external link (href), and should not have any items`
                    );
                }

                return {
                    title: tabConfig.displayName,
                    icon: tabConfig.icon,
                    url: tabConfig.href
                };
            }

            if (tabbedItem.layout == null) {
                throw new Error(
                    `Tab ${tabConfig.displayName} does not contain an external link (href), and should have items`
                );
            }

            const tabbedItems = await Promise.all(
                tabbedItem.layout.map((item) =>
                    convertNavigationItem({
                        item,
                        parsedDocsConfig,
                        context,
                        apiCollector
                    })
                )
            );

            return {
                title: tabConfig.displayName,
                icon: tabConfig.icon,
                items: tabbedItems,
                urlSlugOverride: tabConfig.slug
            };
        })
    );
}

function convertAvailability(availability: docsYml.RawSchemas.VersionAvailability): DocsV1Write.VersionAvailability {
    switch (availability) {
        case "beta":
            return DocsV1Write.VersionAvailability.Beta;
        case "deprecated":
            return DocsV1Write.VersionAvailability.Deprecated;
        case "ga":
            return DocsV1Write.VersionAvailability.GenerallyAvailable;
        case "stable":
            return DocsV1Write.VersionAvailability.Stable;
        default:
            assertNever(availability);
    }
}

async function convertUnversionedNavigationConfig({
    navigationConfig,
    tabs,
    parsedDocsConfig,
    context,
    apiCollector
}: {
    navigationConfig: docsYml.UnversionedNavigationConfiguration;
    tabs?: Record<string, docsYml.RawSchemas.TabConfig>;
    parsedDocsConfig: docsYml.ParsedDocsConfiguration;
    context: TaskContext;
    version: string | undefined;
    apiCollector: ReferencedAPICollector;
}): Promise<DocsV1Write.UnversionedNavigationConfig> {
    switch (navigationConfig.type) {
        case "untabbed":
            return {
                items: await Promise.all(
                    navigationConfig.items.map((item) =>
                        convertNavigationItem({
                            item,
                            parsedDocsConfig,
                            context,
                            apiCollector
                        })
                    )
                )
            };
        case "tabbed":
            return {
                tabs: await convertTabbedNavigation(navigationConfig.items, {
                    tabs,
                    parsedDocsConfig,
                    context,
                    apiCollector
                })
            };
        default:
            assertNever(navigationConfig);
    }
}

async function convertNavigationItem({
    item,
    parsedDocsConfig,
    context,
    apiCollector
}: {
    item: docsYml.DocsNavigationItem;
    parsedDocsConfig: docsYml.ParsedDocsConfiguration;
    context: TaskContext;
    apiCollector: ReferencedAPICollector;
}): Promise<DocsV1Write.NavigationItem> {
    switch (item.type) {
        case "page":
            return {
                type: "page",
                title: item.title,
                id: relative(dirname(parsedDocsConfig.absoluteFilepath), item.absolutePath),
                urlSlugOverride: item.slug
            };
        case "section":
            return {
                type: "section",
                title: item.title,
                items: await Promise.all(
                    item.contents.map((nestedItem) =>
                        convertNavigationItem({
                            item: nestedItem,
                            parsedDocsConfig,
                            context,
                            apiCollector
                        })
                    )
                ),
                urlSlugOverride: item.slug,
                collapsed: item.collapsed
            };
        case "apiSection": {
            const apiId = apiCollector.addReferencedAPI(item);
            return {
                type: "api",
                title: item.title,
                api: apiId,
                showErrors: item.showErrors
            };
        }
        case "link":
            return {
                type: "link",
                title: item.text,
                url: item.url
            };
        default:
            assertNever(item);
    }
}
