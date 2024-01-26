import { assertNever } from "@fern-api/core-utils";
import { SdkGroupName } from "@fern-fern/openapi-ir-model/commons";
import { Schema } from "@fern-fern/openapi-ir-model/finalIr";

export function getGroupNameForSchema(schema: Schema): SdkGroupName | undefined {
    switch (schema.type) {
        case "object":
        case "enum":
        case "array":
        case "map":
        case "reference":
        case "literal":
        case "optional":
        case "nullable":
        case "primitive":
            return schema.groupName ?? undefined;
        case "oneOf":
            return schema.oneOf.groupName ?? undefined;
        case "unknown":
            return undefined;
        default:
            assertNever(schema);
    }
}
