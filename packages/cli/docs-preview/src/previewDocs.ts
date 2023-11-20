import { assertNever, entries } from "@fern-api/core-utils";
import {
    DocsNavigationConfiguration,
    DocsNavigationItem,
    ParsedDocsConfiguration,
    parseDocsConfiguration,
    UnversionedNavigationConfiguration,
} from "@fern-api/docs-configuration";
import { DocsV1Write } from "@fern-api/fdr-sdk";
import { dirname, relative } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { DocsWorkspace } from "@fern-api/workspace-loader";
import { TabConfig, VersionAvailability } from "@fern-fern/docs-config/api";

export async function previewDocs({
    docsWorkspace,
    context,
}: {
    docsWorkspace: DocsWorkspace;
    context: TaskContext;
}): Promise<DocsV1Write.DocsDefinition> {
    const parsedDocsConfig = await parseDocsConfiguration({
        rawDocsConfiguration: docsWorkspace.config,
        context,
        absolutePathToFernFolder: docsWorkspace.absoluteFilepath,
        absoluteFilepathToDocsConfig: docsWorkspace.absoluteFilepathToDocsConfig,
    });
    const writeDocsDefinition = await constructWriteDocsDefinition({
        parsedDocsConfig,
        context,
    });
    return writeDocsDefinition;
}

async function constructWriteDocsDefinition({
    parsedDocsConfig,
    context,
}: {
    parsedDocsConfig: ParsedDocsConfiguration;
    context: TaskContext;
}): Promise<DocsV1Write.DocsDefinition> {
    return {
        pages: entries(parsedDocsConfig.pages).reduce(
            (pages, [pageFilepath, pageContents]) => ({
                ...pages,
                [pageFilepath]: { markdown: pageContents },
            }),
            {}
        ),
        config: await convertDocsConfiguration({
            parsedDocsConfig,
            context,
        }),
    };
}

async function convertDocsConfiguration({
    parsedDocsConfig,
    context,
}: {
    parsedDocsConfig: ParsedDocsConfiguration;
    context: TaskContext;
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
        }),
        colorsV2: {
            accentPrimary:
                parsedDocsConfig.colors?.accentPrimary != null
                    ? parsedDocsConfig.colors.accentPrimary.type === "themed"
                        ? {
                              type: "themed",
                              dark: parsedDocsConfig.colors.accentPrimary.dark,
                              light: parsedDocsConfig.colors.accentPrimary.light,
                          }
                        : parsedDocsConfig.colors.accentPrimary.color != null
                        ? {
                              type: "unthemed",
                              color: parsedDocsConfig.colors.accentPrimary.color,
                          }
                        : undefined
                    : undefined,
            background:
                parsedDocsConfig.colors?.background != null
                    ? parsedDocsConfig.colors.background.type === "themed"
                        ? {
                              type: "themed",
                              dark: parsedDocsConfig.colors.background.dark,
                              light: parsedDocsConfig.colors.background.light,
                          }
                        : parsedDocsConfig.colors.background.color != null
                        ? {
                              type: "unthemed",
                              color: parsedDocsConfig.colors.background.color,
                          }
                        : undefined
                    : undefined,
        },
        navbarLinks: parsedDocsConfig.navbarLinks,
        typography: undefined,
    };
}

async function convertNavigationConfig({
    navigationConfig,
    tabs,
    parsedDocsConfig,
    context,
}: {
    navigationConfig: DocsNavigationConfiguration;
    tabs?: Record<string, TabConfig>;
    parsedDocsConfig: ParsedDocsConfiguration;

    context: TaskContext;
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
                        })
                    )
                ),
            };
        case "tabbed":
            return {
                tabs: await Promise.all(
                    navigationConfig.items.map(async (tabbedItem) => {
                        const tabConfig = tabs?.[tabbedItem.tab];
                        if (tabConfig == null) {
                            throw new Error(`Couldn't find config for tab id ${tabbedItem.tab}`);
                        }
                        return {
                            title: tabConfig.displayName,
                            icon: tabConfig.icon,
                            items: await Promise.all(
                                tabbedItem.layout.map((item) =>
                                    convertNavigationItem({
                                        item,
                                        parsedDocsConfig,

                                        context,
                                    })
                                )
                            ),
                        };
                    })
                ),
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
                                }),
                                availability:
                                    version.availability != null
                                        ? convertAvailability(version.availability)
                                        : undefined,
                                urlSlugOverride: version.slug,
                            };
                        }
                    )
                ),
            };
        default:
            assertNever(navigationConfig);
    }
}

function convertAvailability(availability: VersionAvailability): DocsV1Write.VersionAvailability {
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
}: {
    navigationConfig: UnversionedNavigationConfiguration;
    tabs?: Record<string, TabConfig>;
    parsedDocsConfig: ParsedDocsConfiguration;

    context: TaskContext;
    version: string | undefined;
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
                        })
                    )
                ),
            };
        case "tabbed":
            return {
                tabs: await Promise.all(
                    navigationConfig.items.map(async (tabbedItem) => {
                        const tabConfig = tabs?.[tabbedItem.tab];
                        if (tabConfig == null) {
                            throw new Error(`Couldn't find config for tab id ${tabbedItem.tab}`);
                        }
                        return {
                            title: tabConfig.displayName,
                            icon: tabConfig.icon,
                            items: await Promise.all(
                                tabbedItem.layout.map((item) =>
                                    convertNavigationItem({
                                        item,
                                        parsedDocsConfig,

                                        context,
                                    })
                                )
                            ),
                        };
                    })
                ),
            };
        default:
            assertNever(navigationConfig);
    }
}

async function convertNavigationItem({
    item,
    parsedDocsConfig,
    context,
}: {
    item: DocsNavigationItem;
    parsedDocsConfig: ParsedDocsConfiguration;
    context: TaskContext;
}): Promise<DocsV1Write.NavigationItem> {
    switch (item.type) {
        case "page":
            return {
                type: "page",
                title: item.title,
                id: relative(dirname(parsedDocsConfig.absoluteFilepath), item.absolutePath),
                urlSlugOverride: item.slug,
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
                        })
                    )
                ),
                urlSlugOverride: item.slug,
                collapsed: item.collapsed,
            };
        case "apiSection": {
            return {
                type: "api",
                title: item.title,
                api: item.apiName ?? "api",
                showErrors: item.showErrors,
            };
        }
        default:
            assertNever(item);
    }
}
