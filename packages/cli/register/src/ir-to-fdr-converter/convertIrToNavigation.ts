import { generatorsYml } from "@fern-api/configuration";
import { APIV1Write } from "@fern-api/fdr-sdk";
import { FernIr, IntermediateRepresentation } from "@fern-api/ir-sdk";

export function convertIrToNavigation(
    ir: IntermediateRepresentation,
    navigation: generatorsYml.NavigationSchema | undefined
): APIV1Write.ApiNavigationConfigRoot | undefined {
    if (navigation == null) {
        return undefined;
    }

    const defaultRoot = convertIrToDefaultNavigationConfigRoot(ir);

    const items = visitAndSortNavigationSchema(
        Array.isArray(navigation) ? navigation : [navigation],
        defaultRoot.items,
        ir
    );

    return { items };
}

export function convertIrToDefaultNavigationConfigRoot(
    ir: IntermediateRepresentation
): APIV1Write.ApiNavigationConfigRoot {
    const items: APIV1Write.ApiNavigationConfigItem[] = convertPackageToNavigationConfigItems(ir.rootPackage, ir);
    return { items };
}

function convertPackageToNavigationConfigItems(
    package_: FernIr.Package,
    ir: IntermediateRepresentation
): APIV1Write.ApiNavigationConfigItem[] {
    if (package_.navigationConfig != null) {
        const pointsToPackage = ir.subpackages[package_.navigationConfig.pointsTo];
        if (pointsToPackage != null) {
            return convertPackageToNavigationConfigItems(pointsToPackage, ir);
        }
    }

    const items: APIV1Write.ApiNavigationConfigItem[] = [];

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
    return function (item: APIV1Write.ApiNavigationConfigItem): boolean {
        if (item.type === "subpackage") {
            // subpackages are keyed by a generated ID, so we need to look up the original name
            return ir.subpackages[item.subpackageId]?.name.originalName === key;
        } else {
            // endpoints, webhooks, and websockets are keyed by their original name
            return key === item.value;
        }
    };
}

function visitAndSortNavigationSchema(
    navigationItems: generatorsYml.NavigationSchema,
    defaultItems: APIV1Write.ApiNavigationConfigItem[],
    ir: IntermediateRepresentation
): APIV1Write.ApiNavigationConfigItem[] {
    const items: APIV1Write.ApiNavigationConfigItem[] = [];
    for (const navigationItem of Array.isArray(navigationItems) ? navigationItems : [navigationItems]) {
        if (typeof navigationItem === "string") {
            // item could either be a group name or method name
            // however in this implementation, we only support method name
            // TODO: consider allowing user to specify a "naked" group name that preserves the default order of it's children
            const foundItem = defaultItems.find(createItemMatcher(navigationItem, ir));

            if (foundItem != null && foundItem.type !== "subpackage") {
                items.push(foundItem);
            }
        } else {
            // item must be a collection of groups

            for (const [groupName, group] of Object.entries(navigationItem)) {
                // item could either be a group name or method name
                const foundItem = defaultItems.find(createItemMatcher(groupName, ir));

                if (foundItem != null && foundItem.type === "subpackage") {
                    items.push({
                        type: "subpackage",
                        subpackageId: foundItem.subpackageId,
                        items: visitAndSortNavigationSchema(group, foundItem.items, ir)
                    });
                }
            }
        }
    }

    return items;
}
