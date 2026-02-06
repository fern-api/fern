import { FernIr } from "@fern-fern/ir-sdk";
import { OpenAPIV3 } from "openapi-types";

import { convertTypeReference, getReferenceFromDeclaredTypeName, OpenApiComponentSchema } from "./typeConverter.js";

export interface ObjectProperty {
    docs: string | undefined;
    name: FernIr.NameAndWireValue;
    valueType: FernIr.TypeReference;
    example?: FernIr.ExampleObjectProperty | FernIr.ExampleInlinedRequestBodyProperty;
}

export function convertObject({
    docs,
    properties,
    extensions
}: {
    docs: string | undefined;
    properties: ObjectProperty[];
    extensions: FernIr.DeclaredTypeName[];
}): OpenAPIV3.SchemaObject {
    const convertedProperties: Record<string, OpenApiComponentSchema> = {};
    const required: string[] = [];
    properties.forEach((objectProperty) => {
        const convertedObjectProperty = convertTypeReference(objectProperty.valueType);

        let example: unknown = undefined;
        if (objectProperty.example != null && objectProperty.valueType.type === "primitive") {
            example = objectProperty.example.value.jsonExample;
        } else if (
            objectProperty.example != null &&
            objectProperty.valueType.type === "container" &&
            objectProperty.valueType.container.type === "list" &&
            objectProperty.valueType.container.list.type === "primitive"
        ) {
            example = objectProperty.example.value.jsonExample;
        }

        convertedProperties[objectProperty.name.wireValue] = {
            ...convertedObjectProperty,
            description: objectProperty.docs ?? undefined,
            example
        };
        const isOptionalProperty =
            objectProperty.valueType.type === "container" && objectProperty.valueType.container.type === "optional";
        if (!isOptionalProperty) {
            required.push(objectProperty.name.wireValue);
        }
    });
    const convertedSchemaObject: OpenAPIV3.SchemaObject = {
        type: "object",
        description: docs,
        properties: convertedProperties
    };
    if (required.length > 0) {
        convertedSchemaObject.required = required;
    }
    if (extensions.length > 0) {
        convertedSchemaObject.allOf = extensions.map((declaredTypeName) => {
            return {
                $ref: getReferenceFromDeclaredTypeName(declaredTypeName)
            };
        });
    }
    return convertedSchemaObject;
}
