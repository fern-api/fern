import { IntermediateRepresentation } from "@fern-api/api";
import { TypeResolver } from "@fern-typescript/commons";
import { Directory } from "ts-morph";
import { generateError } from "./generateError";

export function generateErrorFiles({
    modelDirectory,
    intermediateRepresentation,
    typeResolver,
}: {
    modelDirectory: Directory;
    intermediateRepresentation: IntermediateRepresentation;
    typeResolver: TypeResolver;
}): void {
    for (const error of intermediateRepresentation.errors) {
        generateError({
            error,
            modelDirectory,
            typeResolver,
        });
    }
}
