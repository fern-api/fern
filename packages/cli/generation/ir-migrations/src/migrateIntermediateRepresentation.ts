import * as V2 from "@fern-fern/ir-model";
import { getIntermediateRepresentationMigrator } from "./IntermediateRepresentationMigrator";

export function migrateIntermediateRepresentation({
    generatorName,
    generatorVersion,
    intermediateRepresentation,
}: {
    generatorName: string;
    generatorVersion: string;
    intermediateRepresentation: V2.ir.IntermediateRepresentation;
}): unknown {
    return getIntermediateRepresentationMigrator().migrateBackwards({
        generatorName,
        generatorVersion,
        intermediateRepresentation,
    });
}
