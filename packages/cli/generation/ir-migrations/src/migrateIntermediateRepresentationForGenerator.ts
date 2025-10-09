import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";

import { getIntermediateRepresentationMigrator } from "./IntermediateRepresentationMigrator";
import { GeneratorNameAndVersion } from "./IrMigrationContext";

export function migrateIntermediateRepresentationForGenerator({
    intermediateRepresentation,
    context,
    targetGenerator
}: {
    intermediateRepresentation: IntermediateRepresentation;
    context: TaskContext;
    targetGenerator: GeneratorNameAndVersion;
}): Promise<unknown> {
    const migrated = getIntermediateRepresentationMigrator().migrateForGenerator({
        intermediateRepresentation,
        context,
        targetGenerator
    });
    return migrated.jsonify();
}

export function migrateIntermediateRepresentationToVersionForGenerator({
    intermediateRepresentation,
    context,
    targetGenerator,
    irVersion
}: {
    intermediateRepresentation: IntermediateRepresentation;
    context: TaskContext;
    targetGenerator: GeneratorNameAndVersion;
    irVersion: string;
}): Promise<unknown> {
    const migrated = getIntermediateRepresentationMigrator().migrateThroughVersion({
        version: irVersion,
        intermediateRepresentation,
        context,
        targetGenerator
    });
    return migrated.jsonify();
}

/**
 * Migrates the IR for a generator using FDR-fetched version information first,
 * falling back to hardcoded logic if FDR is unavailable.
 * This provides more accurate migration behavior than the hardcoded approach.
 */
export async function migrateIntermediateRepresentationForGeneratorWithFdr({
    intermediateRepresentation,
    context,
    targetGenerator
}: {
    intermediateRepresentation: IntermediateRepresentation;
    context: TaskContext;
    targetGenerator: GeneratorNameAndVersion;
}): Promise<unknown> {
    const migrated = await getIntermediateRepresentationMigrator().migrateForGeneratorWithFdr({
        intermediateRepresentation,
        context,
        targetGenerator
    });
    return migrated.jsonify();
}
