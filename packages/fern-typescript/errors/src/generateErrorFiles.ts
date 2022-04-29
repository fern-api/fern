import { IntermediateRepresentation } from "@fern-api/api";
import { getOrCreateDirectory } from "@fern-typescript/commons";
import { Directory } from "ts-morph";
import { generateError } from "./generateError";

export function generateErrorFiles({
    directory,
    modelDirectory,
    intermediateRepresentation,
}: {
    directory: Directory;
    modelDirectory: Directory;
    intermediateRepresentation: IntermediateRepresentation;
}): Directory {
    const errorsDirectory = getOrCreateDirectory(directory, "errors");
    for (const error of intermediateRepresentation.errors) {
        generateError({
            error,
            errorsDirectory,
            modelDirectory,
        });
    }
    return errorsDirectory;
}
