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
        defaultRoot.items
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
                subpackageId: subpackage.name.originalName,
                items: convertPackageToNavigationConfigItems(subpackage, ir)
            });
        }
    });

    return items;
}

function visitAndSortNavigationSchema(
    navigationItems: generatorsYml.NavigationSchema,
    defaultItems: APIV1Write.ApiNavigationConfigItem[]
): APIV1Write.ApiNavigationConfigItem[] {
    const items: APIV1Write.ApiNavigationConfigItem[] = [];
    for (const navigationItem of Array.isArray(navigationItems) ? navigationItems : [navigationItems]) {
        if (typeof navigationItem === "string") {
            // item could either be a group name or method name
            const foundItem = defaultItems.find((item) =>
                item.type === "subpackage" ? item.subpackageId === navigationItem : item.value === navigationItem
            );

            if (foundItem == null) {
                throw new Error(`Navigation item ${navigationItem} not found`);
            } else if (foundItem.type === "subpackage") {
                throw new Error(
                    `Navigation item ${navigationItem} is a SDK group name when it is expected to be a SDK method name`
                );
            } else {
                items.push(foundItem);
            }
        } else {
            // item is a collection of groups

            for (const [groupName, group] of Object.entries(navigationItem)) {
                // item could either be a group name or method name
                const foundItem = defaultItems.find((item) =>
                    item.type === "subpackage" ? item.subpackageId === groupName : item.value === groupName
                );

                if (foundItem == null) {
                    throw new Error(`Navigation item ${groupName} not found`);
                } else if (foundItem.type === "subpackage") {
                    items.push({
                        type: "subpackage",
                        subpackageId: foundItem.subpackageId,
                        items: visitAndSortNavigationSchema(group, foundItem.items)
                    });
                } else {
                    throw new Error(
                        `Navigation item ${groupName} is a SDK method name when it is expected to be a SDK group name`
                    );
                }
            }
        }
    }

    if (items.length !== defaultItems.length) {
        throw new Error("Sorted schema does not match the default navigation");
    }

    return items;
}
