import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";

import { getIntermediateRepresentationMigrator } from "./IntermediateRepresentationMigrator";
import { GeneratorNameAndVersion } from "./IrMigrationContext";

export async function migrateIntermediateRepresentationForGenerator({
    intermediateRepresentation,
    context,
    targetGenerator
}: {
    intermediateRepresentation: IntermediateRepresentation;
    context: TaskContext;
    targetGenerator: GeneratorNameAndVersion;
}): Promise<unknown> {
    try {
        // Try FDR-based migration first for more accurate IR version requirements
        const migrated = await getIntermediateRepresentationMigrator().migrateForGeneratorWithFdr({
            intermediateRepresentation,
            context,
            targetGenerator
        });
        return migrated.jsonify();
    } catch (error) {
        // Fall back to hardcoded migration logic if FDR fails (offline usage, network issues, etc.)
        context.logger.debug(`FDR-based migration failed, falling back to hardcoded logic: ${error}`);
        const migrated = getIntermediateRepresentationMigrator().migrateForGenerator({
            intermediateRepresentation,
            context,
            targetGenerator
        });
        return migrated.jsonify();
    }
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
