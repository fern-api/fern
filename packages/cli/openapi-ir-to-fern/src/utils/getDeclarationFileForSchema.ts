import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/configuration";
import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { Schema } from "@fern-api/openapi-ir-sdk";
import { camelCase } from "lodash-es";

const PACKAGE_MARKER_RELATIVE_FILEPATH = RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME);

export function getDeclarationFileForSchema(schema: Schema): RelativeFilePath {
    switch (schema.type) {
        case "object":
            return getDeclarationFileFromGroupName(schema.groupName);
        case "enum":
            return getDeclarationFileFromGroupName(schema.groupName);
        case "oneOf":
            return getDeclarationFileFromGroupName(schema.value.groupName);
        case "array":
            return getDeclarationFileFromGroupName(schema.groupName);
        case "map":
            return getDeclarationFileFromGroupName(schema.groupName);
        case "reference":
            return getDeclarationFileFromGroupName(schema.groupName);
        case "literal":
            return getDeclarationFileFromGroupName(schema.groupName);
        case "optional":
            return getDeclarationFileFromGroupName(schema.groupName);
        case "nullable":
            return getDeclarationFileFromGroupName(schema.groupName);
        case "primitive":
            return getDeclarationFileFromGroupName(schema.groupName);
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
function getDeclarationFileFromGroupName(groupName: string | string[] | null | undefined) {
    if (groupName == null) {
        return PACKAGE_MARKER_RELATIVE_FILEPATH;
    }

    if (Array.isArray(groupName)) {
        if (groupName.length === 0) {
            return PACKAGE_MARKER_RELATIVE_FILEPATH;
        }
        return RelativeFilePath.of(`${groupName.map(camelCase).join("/")}.yml`);
    }

    return RelativeFilePath.of(`${camelCase(groupName)}.yml`);
}
