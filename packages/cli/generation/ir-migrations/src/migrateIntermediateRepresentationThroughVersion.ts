import { CasingsGenerator } from "@fern-api/casings-generator";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";

import { getIntermediateRepresentationMigrator } from "./IntermediateRepresentationMigrator.js";

export function migrateIntermediateRepresentationThroughVersion({
    intermediateRepresentation,
    context,
    version,
    casingsGenerator
}: {
    intermediateRepresentation: IntermediateRepresentation;
    context: TaskContext;
    version: string;
    casingsGenerator?: CasingsGenerator;
}): Promise<unknown> {
    const migrated = getIntermediateRepresentationMigrator().migrateThroughVersion({
        version,
        intermediateRepresentation,
        context,
        casingsGenerator
    });
    return migrated.jsonify();
}
