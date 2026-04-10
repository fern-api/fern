import {
    DeclaredTypeName,
    ExampleInlinedRequestBodyProperty,
    ExampleObjectProperty,
    NameAndWireValueOrString,
    TypeReference
} from "@fern-api/ir-sdk";
import { getWireValue } from "@fern-api/ir-utils";
import { OpenAPIV3 } from "openapi-types";
import { convertTypeReference, getReferenceFromDeclaredTypeName, OpenApiComponentSchema } from "./typeConverter.js";

export interface ObjectProperty {
    docs: string | undefined;
    name: NameAndWireValueOrString;
    valueType: TypeReference;
    example?: ExampleObjectProperty | ExampleInlinedRequestBodyProperty;
}

export function convertObject({
    docs,
    properties,
    extensions
}: {
    docs: string | undefined;
    properties: ObjectProperty[];
    extensions: DeclaredTypeName[];
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

        convertedProperties[getWireValue(objectProperty.name)] = {
            ...convertedObjectProperty,
            description: objectProperty.docs ?? undefined,
            example
        };
        const isOptionalProperty =
            objectProperty.valueType.type === "container" && objectProperty.valueType.container.type === "optional";
        if (!isOptionalProperty) {
            required.push(getWireValue(objectProperty.name));
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
