import { FERN_PACKAGE_MARKER_FILENAME_NO_EXTENSION } from "@fern-api/configuration";
import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { SdkGroupName } from "@fern-api/openapi-ir-sdk";
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
