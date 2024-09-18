import { FERN_PACKAGE_MARKER_FILENAME_NO_EXTENSION } from "@fern-api/configuration";
import { assertNever } from "@fern-api/core-utils";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { EndpointSdkName, SdkGroupName } from "@fern-api/openapi-ir-sdk";
import { camelCase } from "lodash-es";

export function convertSdkGroupNameToFileWithoutExtension(groupName: SdkGroupName | undefined): string {
    if (groupName == null || groupName.length === 0) {
        return FERN_PACKAGE_MARKER_FILENAME_NO_EXTENSION;
    }
    const fileNames: string[] = [];
    for (const [index, group] of groupName.entries()) {
        if (typeof group === "string") {
            fileNames.push(camelCase(group));
        } else if (typeof group === "object") {
            switch (group.type) {
                case "namespace": {
                    if (index < groupName.length - 1) {
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
        groupName = [{ type: "namespace", name: namespaceOverride }];
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
