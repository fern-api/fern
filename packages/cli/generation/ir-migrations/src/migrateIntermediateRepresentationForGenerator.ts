import { CasingsGenerator } from "@fern-api/casings-generator";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";

import { getIntermediateRepresentationMigrator } from "./IntermediateRepresentationMigrator.js";
import { GeneratorNameAndVersion } from "./IrMigrationContext.js";

export function migrateIntermediateRepresentationForGenerator({
    intermediateRepresentation,
    context,
    targetGenerator,
    casingsGenerator
}: {
    intermediateRepresentation: IntermediateRepresentation;
    context: TaskContext;
    targetGenerator: GeneratorNameAndVersion;
    casingsGenerator?: CasingsGenerator;
}): Promise<unknown> {
    const migrated = getIntermediateRepresentationMigrator().migrateForGenerator({
        intermediateRepresentation,
        context,
        targetGenerator,
        casingsGenerator
    });
    return migrated.jsonify();
}

export function migrateIntermediateRepresentationToVersionForGenerator({
    intermediateRepresentation,
    context,
    targetGenerator,
    irVersion,
    casingsGenerator
}: {
    intermediateRepresentation: IntermediateRepresentation;
    context: TaskContext;
    targetGenerator: GeneratorNameAndVersion;
    irVersion: string;
    casingsGenerator?: CasingsGenerator;
}): Promise<unknown> {
    const migrated = getIntermediateRepresentationMigrator().migrateThroughVersion({
        version: irVersion,
        intermediateRepresentation,
        context,
        targetGenerator,
        casingsGenerator
    });
    return migrated.jsonify();
}
