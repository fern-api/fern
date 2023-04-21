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

export function convertSchema(
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
    wrapAsOptional: boolean
): Schema {
    if (isReferenceObject(schema)) {
        const referenceSchema = Schema.reference({
            reference: getSchemaIdFromReference(schema),
            description: undefined,
        });
        if (wrapAsOptional) {
            return Schema.optional({
                value: referenceSchema,
                description: undefined,
            });
        } else {
            return referenceSchema;
        }
    } else {
        return convertSchemaObject(schema, wrapAsOptional);
    }
}

function convertSchemaObject(schema: OpenAPIV3.SchemaObject, wrapAsOptional: boolean): Schema {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const schemaName = (schema as any)["x-name"] as string | undefined;
    const description = schema.description;

    // enums
    if (schema.enum != null) {
        if (!isListOfStrings(schema.enum)) {
            // If enum is not a list of strings, just type as a string.
            // TODO(dsinghvi): Emit a warning we are doing this.
            return wrapPrimitive({
                primitive: PrimitiveSchemaValue.string(),
                wrapAsOptional,
                description,
            });
        }
        return convertEnum({
            schemaName,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            enumNames: (schema as any)["x-enum-names"] as Record<string, string> | undefined,
            enumValues: schema.enum,
            description,
            wrapAsOptional,
        });
    }

    // primitive types
    if (schema === "boolean" || schema.type === "boolean") {
        return wrapPrimitive({
            primitive: PrimitiveSchemaValue.boolean(),
            wrapAsOptional,
            description,
        });
    }
    if (schema === "number" || schema.type === "number") {
        return convertNumber({ format: schema.format, description, wrapAsOptional });
    }
    if (schema === "integer" || schema.type === "integer") {
        return wrapPrimitive({
            primitive: PrimitiveSchemaValue.int(),
            wrapAsOptional,
            description,
        });
    }
    if (schema === "string" || schema.type === "string") {
        return wrapPrimitive({
            primitive: PrimitiveSchemaValue.string(),
            wrapAsOptional,
            description,
        });
    }

    // arrays
    if (schema.type === "array") {
        return convertArray({ item: schema.items, description, wrapAsOptional });
    }

    // maps
    if (schema.additionalProperties != null) {
        return convertAdditionalProperties({
            additionalProperties: schema.additionalProperties,
            description,
            wrapAsOptional,
        });
    }

    // objects
    if (schema.type === "object") {
        return convertObject({
            properties: schema.properties ?? {},
            objectName: schemaName,
            description,
            required: schema.required,
            wrapAsOptional,
        });
    }

    // TODO(dsinghvi): handle oneOf

    // handle singular allOfs
    if (schema.allOf != null && schema.allOf.length === 1 && schema.allOf[0] != null) {
        const convertedSchema = convertSchema(schema.allOf[0], wrapAsOptional);
        if (convertedSchema.type === "reference") {
            return Schema.reference({
                reference: convertedSchema.reference,
                description,
            });
        } else if (convertedSchema.type === "optional" && convertedSchema.value.type === "reference") {
            return Schema.optional({
                value: Schema.reference({
                    reference: convertedSchema.value.reference,
                    description: undefined,
                }),
                description,
            });
        }
        return convertedSchema;
    }

    throw new Error(`Failed to convert schema value=${JSON.stringify(schema)}`);
}

function isListOfStrings(x: unknown): x is string[] {
    return Array.isArray(x) && x.every((item) => typeof item === "string");
}

export function wrapPrimitive({
    primitive,
    wrapAsOptional,
    description,
}: {
    primitive: PrimitiveSchemaValue;
    wrapAsOptional: boolean;
    description: string | undefined;
}): Schema {
    if (wrapAsOptional) {
        return Schema.optional({
            value: Schema.primitive({
                schema: primitive,
                description: undefined,
            }),
            description,
        });
    }
    return Schema.primitive({
        schema: primitive,
        description,
    });
}
