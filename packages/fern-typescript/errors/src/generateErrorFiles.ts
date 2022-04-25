import { IntermediateRepresentation } from "@fern-api/api";
import { withDirectory } from "@fern-typescript/commons";
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
    return withDirectory({ containingModule: directory, name: "errors" }, (errorsDirectory) => {
        for (const error of intermediateRepresentation.errors) {
            generateError({
                error,
                errorsDirectory,
                modelDirectory,
            });
        }
    });
}
