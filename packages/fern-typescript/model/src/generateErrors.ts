import { IntermediateRepresentation } from "@fern-api/api";
import { withDirectory } from "@fern-api/typescript-commons";
import { Directory } from "ts-morph";
import { generateError } from "./errors/generateError";

export function generateErrorFiles({
    directory,
    modelDirectory,
    intermediateRepresentation,
}: {
    directory: Directory;
    modelDirectory: Directory;
    intermediateRepresentation: IntermediateRepresentation;
}): Directory {
    return withDirectory(directory, "errors", (errorsDirectory) => {
        for (const error of intermediateRepresentation.errors) {
            generateError({
                error,
                errorsDirectory,
                modelDirectory,
            });
        }
    });
}
