import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { getIntermediateRepresentationMigrator } from "./IntermediateRepresentationMigrator";

export function migrateIntermediateRepresentation({
    generatorName,
    generatorVersion,
    intermediateRepresentation,
}: {
    generatorName: string;
    generatorVersion: string;
    intermediateRepresentation: IntermediateRepresentation;
}): unknown {
    return getIntermediateRepresentationMigrator().migrateBackwards({
        generatorName,
        generatorVersion,
        intermediateRepresentation,
    });
}
