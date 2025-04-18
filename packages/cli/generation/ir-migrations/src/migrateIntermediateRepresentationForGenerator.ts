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
