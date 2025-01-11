import { camelCase } from "lodash-es";

import { FERN_PACKAGE_MARKER_FILENAME_NO_EXTENSION } from "@fern-api/configuration";
import { assertNever } from "@fern-api/core-utils";
import { EndpointSdkName, SdkGroupName } from "@fern-api/openapi-ir";
import { RelativeFilePath, join } from "@fern-api/path-utils";

function cleanSdkGroupName(groupName: SdkGroupName): SdkGroupName {
    const maybeNamespace = groupName.find((group) => typeof group === "object" && group.type === "namespace");
    const noNamespace = groupName.filter((group) => typeof group === "string" || group.type !== "namespace");
    return maybeNamespace ? [maybeNamespace, ...noNamespace] : noNamespace;
}

export function convertSdkGroupNameToFileWithoutExtension(groupName: SdkGroupName | undefined): string {
    const cleanedGroupName = groupName ? cleanSdkGroupName(groupName) : undefined;
    if (cleanedGroupName == null || cleanedGroupName.length === 0) {
        return FERN_PACKAGE_MARKER_FILENAME_NO_EXTENSION;
    }
    const fileNames: string[] = [];
    for (const [index, group] of cleanedGroupName.entries()) {
        if (typeof group === "string") {
            fileNames.push(camelCase(group));
        } else if (typeof group === "object") {
            switch (group.type) {
                case "namespace": {
                    if (index < cleanedGroupName.length - 1) {
                        fileNames.push(camelCase(group.name));
                    } else {
                        // For the last namespace, make it a true namespace (ie. a directory with it's contents in the root package marker)
                        fileNames.push(...[group.name, FERN_PACKAGE_MARKER_FILENAME_NO_EXTENSION]);
                    }
                    break;
                }
                default:
                    assertNever(group.type);
            }
        } else {
            assertNever(group);
        }
    }

    return fileNames.join("/");
}

export function convertSdkGroupNameToFile(groupName: SdkGroupName | undefined): RelativeFilePath {
    return RelativeFilePath.of(`${convertSdkGroupNameToFileWithoutExtension(groupName)}.yml`);
}

export function convertEndpointSdkNameToFileWithoutExtension({
    sdkName,
    namespaceOverride
}: {
    sdkName: EndpointSdkName | undefined;
    namespaceOverride: string | undefined;
}): string {
    let groupName: SdkGroupName;
    if (sdkName == null || (sdkName.groupName.length === 0 && namespaceOverride == null)) {
        return FERN_PACKAGE_MARKER_FILENAME_NO_EXTENSION;
    } else if (namespaceOverride != null) {
        // Override the namespace in the event it doesn't have one or it has one and we want to change it
        groupName = [
            { type: "namespace", name: namespaceOverride },
            ...sdkName.groupName.filter((group) => typeof group === "string" || group.type !== "namespace")
        ];
    } else {
        groupName = sdkName.groupName;
    }

    return convertSdkGroupNameToFileWithoutExtension(groupName);
}

export function convertEndpointSdkNameToFile({
    sdkName,
    namespaceOverride
}: {
    sdkName: EndpointSdkName | undefined;
    namespaceOverride: string | undefined;
}): RelativeFilePath {
    return RelativeFilePath.of(`${convertEndpointSdkNameToFileWithoutExtension({ sdkName, namespaceOverride })}.yml`);
}

export function resolveLocationWithNamespace({
    location,
    namespaceOverride
}: {
    location: RelativeFilePath;
    namespaceOverride: string | undefined;
}): RelativeFilePath {
    if (namespaceOverride != null) {
        return join(RelativeFilePath.of(namespaceOverride), location);
    }
    return location;
}
