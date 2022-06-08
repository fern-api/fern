import { IntermediateRepresentation } from "@fern-api/api";
import { getOrCreateDirectory, TypeResolver } from "@fern-typescript/commons";
import { Directory } from "ts-morph";
import { generateError } from "./generateError";

export function generateErrorFiles({
    directory,
    modelDirectory,
    intermediateRepresentation,
    typeResolver,
}: {
    directory: Directory;
    modelDirectory: Directory;
    intermediateRepresentation: IntermediateRepresentation;
    typeResolver: TypeResolver;
}): Directory {
    const errorsDirectory = getOrCreateDirectory(directory, "errors");
    for (const error of intermediateRepresentation.errors) {
        generateError({
            error,
            errorsDirectory,
            modelDirectory,
            typeResolver,
        });
    }
    return errorsDirectory;
}
