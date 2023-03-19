import { TaskContext } from "@fern-api/task-context";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { getIntermediateRepresentationMigrator } from "./IntermediateRepresentationMigrator";

export function migrateIntermediateRepresentationThroughVersion({
    intermediateRepresentation,
    context,
    version,
}: {
    intermediateRepresentation: IntermediateRepresentation;
    context: TaskContext;
    version: string;
}): unknown {
    return getIntermediateRepresentationMigrator().migrateThroughVersion({
        version,
        intermediateRepresentation,
        context,
    });
}
