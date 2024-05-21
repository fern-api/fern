import { docsYml } from "@fern-api/configuration";
import { DocsV1Write } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, dirname, relative } from "@fern-api/fs-utils";
import { FernIr, IntermediateRepresentation } from "@fern-api/ir-sdk";

export function convertIrToNavigation(
    ir: IntermediateRepresentation,
    rootSummaryAbsolutePath: AbsoluteFilePath | undefined,
    navigation: docsYml.ParsedApiNavigationItem[] | undefined,
    absoluteFilepathToDocsConfig: AbsoluteFilePath,
    fullSlugs: Map<AbsoluteFilePath, string>
): DocsV1Write.ApiNavigationConfigRoot | undefined {
    if (navigation == null) {
        return undefined;
    }

    const defaultRoot = convertIrToDefaultNavigationConfigRoot(ir);

    const items = visitAndSortNavigationSchema(
        navigation,
        defaultRoot.items,
        ir,
        absoluteFilepathToDocsConfig,
        fullSlugs
    );

    return {
        items,
        summaryPageId:
            rootSummaryAbsolutePath == null
                ? undefined
                : relative(dirname(absoluteFilepathToDocsConfig), rootSummaryAbsolutePath)
    };
}

export function convertIrToDefaultNavigationConfigRoot(
    ir: IntermediateRepresentation
): DocsV1Write.ApiNavigationConfigRoot {
    const items: DocsV1Write.ApiNavigationConfigItem[] = convertPackageToNavigationConfigItems(ir.rootPackage, ir);
    return { items };
}

function convertPackageToNavigationConfigItems(
    package_: FernIr.Package,
    ir: IntermediateRepresentation
): DocsV1Write.ApiNavigationConfigItem[] {
    if (package_.navigationConfig != null) {
        const pointsToPackage = ir.subpackages[package_.navigationConfig.pointsTo];
        if (pointsToPackage != null) {
            return convertPackageToNavigationConfigItems(pointsToPackage, ir);
        }
    }

    const items: DocsV1Write.ApiNavigationConfigItem[] = [];

    if (package_.service != null) {
        const httpService = ir.services[package_.service];

        httpService?.endpoints.forEach((endpoint) => {
            items.push({ type: "endpointId", value: endpoint.name.originalName });
        });
    }

    if (package_.websocket != null) {
        const channel = ir.websocketChannels?.[package_.websocket];
        if (channel != null) {
            items.push({ type: "websocketId", value: channel.name.originalName });
        }
    }

    if (package_.webhooks != null) {
        const webhooks = ir.webhookGroups[package_.webhooks];

        webhooks?.forEach((webhook) => {
            items.push({ type: "webhookId", value: webhook.name.originalName });
        });
    }

    package_.subpackages.forEach((subpackageId) => {
        const subpackage = ir.subpackages[subpackageId];

        if (subpackage != null) {
            items.push({
                type: "subpackage",
                subpackageId,
                items: convertPackageToNavigationConfigItems(subpackage, ir)
            });
        }
    });

    return items;
}

function createItemMatcher(key: string, ir: IntermediateRepresentation) {
    return function (item: DocsV1Write.ApiNavigationConfigItem): boolean {
        if (item.type === "subpackage") {
            // subpackages are keyed by a generated ID, so we need to look up the original name
            return ir.subpackages[item.subpackageId]?.name.originalName === key;
        } else if (item.type === "page") {
            return false;
        } else {
            // endpoints, webhooks, and websockets are keyed by their original name
            return key === item.value;
        }
    };
}

function visitAndSortNavigationSchema(
    navigationItems: docsYml.ParsedApiNavigationItem[],
    defaultItems: DocsV1Write.ApiNavigationConfigItem[],
    ir: IntermediateRepresentation,
    absoluteFilepathToDocsConfig: AbsoluteFilePath,
    fullSlugs: Map<AbsoluteFilePath, string>
): DocsV1Write.ApiNavigationConfigItem[] {
    const items: DocsV1Write.ApiNavigationConfigItem[] = [];
    for (const navigationItem of navigationItems) {
        if (navigationItem.type === "item") {
            const foundItem = defaultItems.find(createItemMatcher(navigationItem.value, ir));

            if (foundItem != null && foundItem.type !== "subpackage") {
                items.push(foundItem);
            } else if (foundItem != null) {
                items.push({
                    type: "subpackage",
                    subpackageId: foundItem.subpackageId,
                    items: []
                });
            }
        } else if (navigationItem.type === "page") {
            items.push({
                type: "page",
                id: relative(dirname(absoluteFilepathToDocsConfig), navigationItem.absolutePath),
                title: navigationItem.title,
                icon: undefined,
                hidden: undefined,
                urlSlugOverride: navigationItem.slug,
                fullSlug: fullSlugs.get(navigationItem.absolutePath)?.split("/")
            });
        } else {
            // item must be a collection of subpackages
            const foundItem = defaultItems.find(createItemMatcher(navigationItem.subpackageId, ir));

            if (foundItem != null && foundItem.type === "subpackage") {
                items.push({
                    type: "subpackage",
                    subpackageId: foundItem.subpackageId,
                    summaryPageId:
                        navigationItem.summaryAbsolutePath == null
                            ? undefined
                            : relative(dirname(absoluteFilepathToDocsConfig), navigationItem.summaryAbsolutePath),
                    items: visitAndSortNavigationSchema(
                        navigationItem.items,
                        foundItem.items,
                        ir,
                        absoluteFilepathToDocsConfig,
                        fullSlugs
                    )
                });
            }
        }
    }

    return items;
}
