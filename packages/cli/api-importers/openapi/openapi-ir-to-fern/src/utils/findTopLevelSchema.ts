import { isSchemaEqual, Schema } from "@fern-api/openapi-ir";
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
        if (isSchemaEqual(topLevelSchema, inlineSchema)) {
            return getDeclarationFileForSchema(topLevelSchema);
        }
    }

    // Check in namespaced schemas
    for (const schemas of Object.values(context.ir.groupedSchemas.namespacedSchemas)) {
        for (const topLevelSchema of Object.values(schemas)) {
            if (isSchemaEqual(topLevelSchema, inlineSchema)) {
                return getDeclarationFileForSchema(topLevelSchema);
            }
        }
    }

    return undefined;
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
