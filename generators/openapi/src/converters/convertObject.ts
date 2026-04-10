import { getWireValue } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { OpenAPIV3 } from "openapi-types";

import { convertAvailabilityStatus } from "../utils/convertAvailability.js";
import { convertTypeReference, getReferenceFromDeclaredTypeName, OpenApiComponentSchema } from "./typeConverter.js";

export interface ObjectProperty {
    docs: string | undefined;
    availability?: FernIr.Availability;
    name: FernIr.NameAndWireValue | FernIr.NameAndWireValueOrString;
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

        const propertySchema: Record<string, unknown> = {
            ...convertedObjectProperty,
            description: objectProperty.docs ?? undefined,
            example
        };

        if (objectProperty.availability != null) {
            const availabilityValue = convertAvailabilityStatus(objectProperty.availability.status);
            if (availabilityValue != null) {
                propertySchema["x-fern-availability"] = availabilityValue;
            }
        }

        convertedProperties[getWireValue(objectProperty.name)] = propertySchema as OpenApiComponentSchema;
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
