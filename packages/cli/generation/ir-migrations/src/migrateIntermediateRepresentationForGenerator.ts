import { TaskContext } from "@fern-api/task-context";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { getIntermediateRepresentationMigrator } from "./IntermediateRepresentationMigrator";
import { GeneratorNameAndVersion } from "./IrMigrationContext";

export function migrateIntermediateRepresentationForGenerator({
    intermediateRepresentation,
    context,
    targetGenerator,
}: {
    intermediateRepresentation: IntermediateRepresentation;
    context: TaskContext;
    targetGenerator: GeneratorNameAndVersion;
}): unknown {
    return getIntermediateRepresentationMigrator().migrateForGenerator({
        intermediateRepresentation,
        context,
        targetGenerator,
    });
}
