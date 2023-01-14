import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { getIntermediateRepresentationMigrator } from "./IntermediateRepresentationMigrator";
import { IrMigrationContext } from "./IrMigrationContext";

export function migrateIntermediateRepresentation({
    intermediateRepresentation,
    context,
}: {
    intermediateRepresentation: IntermediateRepresentation;
    context: IrMigrationContext;
}): unknown {
    return getIntermediateRepresentationMigrator().migrateBackwards({
        intermediateRepresentation,
        context,
    });
}
