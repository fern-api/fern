import { assertNever } from "@fern-api/core-utils";
import { ContainerType } from "@fern-api/ir-sdk";
import { JSONSchema4 } from "json-schema";
import { JsonSchemaConverterContext } from "../JsonSchemaConverterContext";
import { convertTypeReferenceToJsonSchema } from "./typeReferenceToJsonSchema";

export function convertContainerToJsonSchema({
    container,
    context
}: {
    container: ContainerType;
    context: JsonSchemaConverterContext;
}): JSONSchema4 {
    switch (container.type) {
        case "list":
            return {
                type: "array",
                items: convertTypeReferenceToJsonSchema({ typeReference: container.list, context })
            };
        case "map":
            return {
                type: "object",
                additionalProperties: convertTypeReferenceToJsonSchema({ typeReference: container.valueType, context })
            };
        case "optional":
            return convertTypeReferenceToJsonSchema({ typeReference: container.optional, context });
        case "set":
            return {
                type: "array",
                items: convertTypeReferenceToJsonSchema({ typeReference: container.set, context }),
                uniqueItems: true
            };
        case "literal":
            return {
                const: container.literal
            };
        default:
            assertNever(container);
    }
}
