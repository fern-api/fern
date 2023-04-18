import { PrimitiveSchemaValue, Schema } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { isReferenceObject } from "../isReferenceObject";
import { convertAdditionalProperties } from "./schema/convertAdditionalProperties";
import { convertArray } from "./schema/convertArray";
import { convertEnum } from "./schema/convertEnum";
import { convertNumber } from "./schema/convertNumber";
import { convertObject } from "./schema/convertObject";

export const SCHEMA_REFERENCE_PREFIX = "#/components/schemas/";

export function getSchemaIdFromReference(ref: OpenAPIV3.ReferenceObject): string {
    if (!ref.$ref.startsWith(SCHEMA_REFERENCE_PREFIX)) {
        throw new Error(`Cannot get schema id from reference: ${ref.$ref}`);
    }
    return ref.$ref.replace(SCHEMA_REFERENCE_PREFIX, "");
}

export function convertSchema(schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject): Schema {
    if (isReferenceObject(schema)) {
        return Schema.reference({
            reference: getSchemaIdFromReference(schema),
            description: undefined,
        });
    } else {
        return convertSchemaObject(schema);
    }
}

function convertSchemaObject(schema: OpenAPIV3.SchemaObject): Schema {
    const schemaName = (schema as any)["x-name"] as string | undefined;
    const description = schema.description;

    // enums
    if (schema.enum != null) {
        if (!isListOfStrings(schema.enum)) {
            // If enum is not a list of strings, just type as a string.
            // TODO(dsinghvi): Emit a warning we are doing this.
            return Schema.primitive({
                schema: PrimitiveSchemaValue.string(),
                description,
            });
        }
        return convertEnum({
            schemaName,
            enumNames: (schema as any)["x-enum-names"] as Record<string, string> | undefined,
            enumValues: schema.enum,
            description,
        });
    }

    // primitive types
    if (schema === "boolean" || schema.type === "boolean") {
        return Schema.primitive({
            schema: PrimitiveSchemaValue.boolean(),
            description,
        });
    }
    if (schema === "number" || schema.type === "number") {
        return convertNumber({ format: schema.format, description });
    }
    if (schema === "integer" || schema.type === "integer") {
        return Schema.primitive({
            schema: PrimitiveSchemaValue.int(),
            description,
        });
    }
    if (schema === "string" || schema.type === "string") {
        return Schema.primitive({
            schema: PrimitiveSchemaValue.string(),
            description,
        });
    }

    // arrays
    if (schema.type === "array") {
        return convertArray({ item: schema.items, description });
    }

    // maps
    if (schema.additionalProperties != null) {
        return convertAdditionalProperties({ additionalProperties: schema.additionalProperties, description });
    }

    // objects
    if (schema.type === "object") {
        return convertObject({ properties: schema.properties ?? {}, objectName: schemaName, description });
    }

    // TODO(dsinghvi): handle oneOf

    // handle singular allOfs
    if (schema.allOf != null && schema.allOf.length === 1 && schema.allOf[0] != null) {
        return convertSchema(schema.allOf[0]);
    }

    throw new Error(`Failed to convert schema for ${JSON.stringify(schema)}`);
}

function isListOfStrings(x: unknown): x is string[] {
    return Array.isArray(x) && x.every((item) => typeof item === "string");
}
