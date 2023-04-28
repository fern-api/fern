import { PrimitiveSchemaValue, ReferencedSchema, Schema } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { isReferenceObject } from "../isReferenceObject";
import { convertAdditionalProperties, wrapMap } from "./schema/convertAdditionalProperties";
import { convertArray } from "./schema/convertArray";
import { convertEnum } from "./schema/convertEnum";
import { convertNumber } from "./schema/convertNumber";
import { convertObject } from "./schema/convertObject";
import { convertDiscriminatedOneOf } from "./schema/convertOneOf";

export const SCHEMA_REFERENCE_PREFIX = "#/components/schemas/";

export function getSchemaIdFromReference(ref: OpenAPIV3.ReferenceObject): string {
    if (!ref.$ref.startsWith(SCHEMA_REFERENCE_PREFIX)) {
        throw new Error(`Cannot get schema id from reference: ${ref.$ref}`);
    }
    return ref.$ref.replace(SCHEMA_REFERENCE_PREFIX, "");
}

export function convertToReferencedSchema(schema: OpenAPIV3.ReferenceObject): ReferencedSchema {
    return Schema.reference({
        // TODO(dsinghvi): references may contain files
        file: undefined,
        schema: getSchemaIdFromReference(schema),
        description: undefined,
    });
}

export function convertSchema(
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
    wrapAsOptional: boolean
): Schema {
    if (isReferenceObject(schema)) {
        const referenceSchema = Schema.reference(convertToReferencedSchema(schema));
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

    // discriminated unions
    if (
        schema.oneOf != null &&
        schema.discriminator != null &&
        schema.discriminator.mapping != null &&
        Object.keys(schema.discriminator.mapping).length > 0
    ) {
        return convertDiscriminatedOneOf({
            description,
            discriminator: schema.discriminator,
            properties: schema.properties ?? {},
            required: schema.required,
            schemaName,
            wrapAsOptional,
        });
    }

    // handle objects
    if (schema.allOf != null || schema.properties != null) {
        // convert a singular allOf as a reference or inlined schema
        if (hasNoProperties(schema) && schema.allOf != null && schema.allOf.length === 1 && schema.allOf[0] != null) {
            const convertedSchema = convertSchema(schema.allOf[0], wrapAsOptional);
            return maybeInjectDescription(convertedSchema, description);
        }
        // otherwise convert as an object
        return convertObject({
            properties: schema.properties ?? {},
            objectName: schemaName,
            description,
            required: schema.required,
            wrapAsOptional,
            allOf: schema.allOf ?? [],
        });
    }

    // handle vanilla object
    if (schema.type === "object" && hasNoOneOf(schema) && hasNoAllOf(schema) && hasNoProperties(schema)) {
        return wrapMap({
            description,
            wrapAsOptional,
            keySchema: PrimitiveSchemaValue.string(),
            valueSchema: Schema.unknown(),
        });
    }

    throw new Error(`Failed to convert schema value=${JSON.stringify(schema)}`);
}

function hasNoOneOf(schema: OpenAPIV3.SchemaObject): boolean {
    return schema.oneOf == null || schema.oneOf.length === 0;
}

function hasNoAllOf(schema: OpenAPIV3.SchemaObject): boolean {
    return schema.allOf == null || schema.allOf.length === 0;
}

function hasNoProperties(schema: OpenAPIV3.SchemaObject): boolean {
    return schema.properties == null || schema.properties.length === 0;
}

function isListOfStrings(x: unknown): x is string[] {
    return Array.isArray(x) && x.every((item) => typeof item === "string");
}

function maybeInjectDescription(schema: Schema, description: string | undefined): Schema {
    if (schema.type === "reference") {
        return Schema.reference({
            file: schema.file,
            schema: schema.schema,
            description,
        });
    } else if (schema.type === "optional" && schema.value.type === "reference") {
        return Schema.optional({
            value: Schema.reference({
                file: schema.value.file,
                schema: schema.value.schema,
                description: undefined,
            }),
            description,
        });
    }
    return schema;
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
