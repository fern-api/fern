import { NameAndWireValue } from "@fern-fern/ir-model/commons";
import { ExampleInlinedRequestBodyProperty } from "@fern-fern/ir-model/services/http";
import { DeclaredTypeName, ExampleObjectProperty, TypeReference } from "@fern-fern/ir-model/types";
import { OpenAPIV3 } from "openapi-types";
import { convertTypeReference, getReferenceFromDeclaredTypeName, OpenApiComponentSchema } from "./typeConverter";

export interface ObjectProperty {
    docs: string | undefined;
    name: NameAndWireValue;
    valueType: TypeReference;
    example?: ExampleObjectProperty | ExampleInlinedRequestBodyProperty;
}

export function convertObject({
    docs,
    properties,
    extensions,
}: {
    docs: string | undefined;
    properties: ObjectProperty[];
    extensions: DeclaredTypeName[];
}): OpenAPIV3.SchemaObject {
    const convertedProperties: Record<string, OpenApiComponentSchema> = {};
    const required: string[] = [];
    properties.forEach((objectProperty) => {
        const convertedObjectProperty = convertTypeReference(objectProperty.valueType);
        convertedProperties[objectProperty.name.wireValue] = {
            ...convertedObjectProperty,
            description: objectProperty.docs ?? undefined,
            example:
                objectProperty.valueType._type === "primitive" && objectProperty.example != null
                    ? objectProperty.example?.value.jsonExample
                    : undefined,
        };
        const isOptionalProperty =
            objectProperty.valueType._type === "container" && objectProperty.valueType.container._type === "optional";
        if (!isOptionalProperty) {
            required.push(objectProperty.name.wireValue);
        }
    });
    const convertedSchemaObject: OpenAPIV3.SchemaObject = {
        type: "object",
        description: docs,
        properties: convertedProperties,
    };
    if (required.length > 0) {
        convertedSchemaObject.required = required;
    }
    if (extensions.length > 0) {
        convertedSchemaObject.allOf = extensions.map((declaredTypeName) => {
            return {
                $ref: getReferenceFromDeclaredTypeName(declaredTypeName),
            };
        });
    }
    return convertedSchemaObject;
}
