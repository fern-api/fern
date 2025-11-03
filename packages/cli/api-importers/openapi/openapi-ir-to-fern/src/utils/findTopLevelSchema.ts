import { Schema } from "@fern-api/openapi-ir";
import { RelativeFilePath } from "@fern-api/path-utils";
import { OpenApiIrConverterContext } from "../OpenApiIrConverterContext";
import { getDeclarationFileForSchema } from "./getDeclarationFileForSchema";

/**
 * Checks if a schema exists as a top-level schema in the IR.
 * If it does, returns the declaration file where it should be located.
 * Otherwise, returns undefined.
 */
export function findTopLevelSchemaFile(
    inlineSchema: Schema,
    context: OpenApiIrConverterContext
): RelativeFilePath | undefined {
    const schemaName = getSchemaName(inlineSchema);
    if (schemaName == null) {
        return undefined;
    }

    // Check in root schemas
    for (const topLevelSchema of Object.values(context.ir.groupedSchemas.rootSchemas)) {
        if (isSameSchema(topLevelSchema, inlineSchema, schemaName)) {
            return getDeclarationFileForSchema(topLevelSchema);
        }
    }

    // Check in namespaced schemas
    for (const schemas of Object.values(context.ir.groupedSchemas.namespacedSchemas)) {
        for (const topLevelSchema of Object.values(schemas)) {
            if (isSameSchema(topLevelSchema, inlineSchema, schemaName)) {
                return getDeclarationFileForSchema(topLevelSchema);
            }
        }
    }

    return undefined;
}

/**
 * Helper to check if a top-level schema matches the given inline schema.
 * Compares both name and type discriminator directly - no string literals needed!
 */
function isSameSchema(topLevelSchema: Schema, inlineSchema: Schema, targetName: string): boolean {
    // Check if names match
    const topLevelName = getSchemaName(topLevelSchema);
    if (topLevelName !== targetName) {
        return false;
    }

    // Direct type comparison: compares the discriminator values
    return topLevelSchema.type === inlineSchema.type;
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
