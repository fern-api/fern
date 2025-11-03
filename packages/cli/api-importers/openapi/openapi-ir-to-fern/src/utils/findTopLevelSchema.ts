import { EnumSchema, ObjectSchema, OneOfSchema, Schema } from "@fern-api/openapi-ir";
import { RelativeFilePath } from "@fern-api/path-utils";
import { OpenApiIrConverterContext } from "../OpenApiIrConverterContext";
import { getDeclarationFileForSchema } from "./getDeclarationFileForSchema";

/**
 * Checks if a schema exists as a top-level schema in the IR.
 * If it does, returns the declaration file where it should be located.
 * Otherwise, returns undefined.
 */
export function findTopLevelSchemaFile(
    schema: EnumSchema | ObjectSchema | OneOfSchema,
    context: OpenApiIrConverterContext
): RelativeFilePath | undefined {
    const schemaName = schema.nameOverride ?? schema.generatedName;

    // Check in root schemas
    for (const topLevelSchema of Object.values(context.ir.groupedSchemas.rootSchemas)) {
        if (isSameSchema(topLevelSchema, schema, schemaName)) {
            return getDeclarationFileForSchema(topLevelSchema);
        }
    }

    // Check in namespaced schemas
    for (const schemas of Object.values(context.ir.groupedSchemas.namespacedSchemas)) {
        for (const topLevelSchema of Object.values(schemas)) {
            if (isSameSchema(topLevelSchema, schema, schemaName)) {
                return getDeclarationFileForSchema(topLevelSchema);
            }
        }
    }

    return undefined;
}

/**
 * Helper to get the schema type tag for inline schemas.
 */
function getInlineSchemaType(inlineSchema: EnumSchema | ObjectSchema | OneOfSchema): "enum" | "object" | "oneOf" {
    // EnumSchema has a values array
    const asEnum = inlineSchema as EnumSchema;
    if (asEnum.values !== undefined) {
        return "enum";
    }

    // ObjectSchema has properties or allOf arrays
    const asObject = inlineSchema as ObjectSchema;
    if (asObject.properties !== undefined || asObject.allOf !== undefined) {
        return "object";
    }

    // Otherwise it's a OneOfSchema
    return "oneOf";
}

/**
 * Helper to check if a top-level schema matches the given inline schema.
 */
function isSameSchema(
    topLevelSchema: Schema,
    inlineSchema: EnumSchema | ObjectSchema | OneOfSchema,
    targetName: string
): boolean {
    // Get the top-level schema name
    const topLevelName = getSchemaName(topLevelSchema);
    if (topLevelName !== targetName) {
        return false;
    }

    // Match based on type
    const inlineType = getInlineSchemaType(inlineSchema);
    return topLevelSchema.type === inlineType;
}

export function getSchemaName(schema: Schema): string | undefined {
    return Schema._visit(schema, {
        primitive: (s) => s.nameOverride ?? s.generatedName,
        object: (s) => s.nameOverride ?? s.generatedName,
        array: (s) => s.nameOverride ?? s.generatedName,
        map: (s) => s.nameOverride ?? s.generatedName,
        enum: (s) => s.nameOverride ?? s.generatedName,
        reference: (s) => s.nameOverride ?? s.generatedName,
        literal: (s) => s.nameOverride ?? s.generatedName,
        oneOf: (s) => s.nameOverride ?? s.generatedName,
        optional: (s) => s.nameOverride ?? s.generatedName,
        nullable: (s) => s.nameOverride ?? s.generatedName,
        unknown: (s) => s.nameOverride ?? s.generatedName,
        _other: () => undefined
    });
}
