import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/configuration";
import { assertNever } from "@fern-api/core-utils";
import { Schema, SdkGroupName } from "@fern-api/openapi-ir";
import { RelativeFilePath } from "@fern-api/path-utils";

import { convertSdkGroupNameToFile } from "./convertSdkGroupName";

const PACKAGE_MARKER_RELATIVE_FILEPATH = RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME);

export function getDeclarationFileForSchema(schema: Schema): RelativeFilePath {
    const schemaName =
        "generatedName" in schema
            ? schema.generatedName
            : "nameOverride" in schema && schema.nameOverride
              ? schema.nameOverride
              : schema.type;

    switch (schema.type) {
        case "object":
        case "primitive":
        case "enum":
        case "array":
        case "map":
        case "reference":
        case "literal":
        case "optional":
        case "nullable": {
            return getDeclarationFileFromGroupName({
                namespace: schema.namespace,
                groupName: schema.groupName
            });
        }
        case "oneOf": {
            return getDeclarationFileFromGroupName({
                namespace: schema.value.namespace,
                groupName: schema.value.groupName
            });
        }
        case "unknown":
            return PACKAGE_MARKER_RELATIVE_FILEPATH;
        default:
            assertNever(schema);
    }
}

/**
 * Get the declaration file for a group name.
 * If the group name is null or undefined, the package marker file will be returned.
 * If the group name is a string, the group name will be camel cased and a .yml extension will be added.
 * If the group name is an array, we create a directory with the group name and add a file with the group name camel cased and a .yml extension.
 */
function getDeclarationFileFromGroupName({
    namespace,
    groupName
}: {
    namespace: string | undefined;
    groupName: SdkGroupName | undefined;
}): RelativeFilePath {
    if (namespace != null && groupName != null) {
        return convertSdkGroupNameToFile([
            {
                type: "namespace",
                name: namespace
            },
            ...groupName
        ]);
    }
    if (namespace != null) {
        return convertSdkGroupNameToFile([
            {
                type: "namespace",
                name: namespace
            }
        ]);
    }
    return convertSdkGroupNameToFile(groupName);
}
