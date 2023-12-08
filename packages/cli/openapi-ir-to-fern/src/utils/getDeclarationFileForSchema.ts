import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/project-configuration";
import { Schema } from "@fern-fern/openapi-ir-model/finalIr";
import { camelCase } from "lodash-es";

const PACKAGE_MARKER_RELATIVE_FILEPATH = RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME);

export function getDeclarationFileForSchema(schema: Schema): RelativeFilePath {
    switch (schema.type) {
        case "object":
            return getDeclarationFileFromGroupName(schema.groupName);
        case "enum":
            return getDeclarationFileFromGroupName(schema.groupName);
        case "oneOf":
            return getDeclarationFileFromGroupName(schema.oneOf.groupName);
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

function getDeclarationFileFromGroupName(groupName: string | null | undefined) {
    if (groupName == null) {
        return PACKAGE_MARKER_RELATIVE_FILEPATH;
    }
    return RelativeFilePath.of(`${camelCase(groupName)}.yml`);
}
