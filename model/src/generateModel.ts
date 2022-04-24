import { IntermediateRepresentation } from "@fern-api/api";
import { withDirectory } from "@fern-api/typescript-commons";
import { Directory } from "ts-morph";
import { generateType } from "./types/generateType";
import { TypeResolver } from "./utils/TypeResolver";

export function generateModelFiles({
    directory,
    intermediateRepresentation,
}: {
    directory: Directory;
    intermediateRepresentation: IntermediateRepresentation;
}): Directory {
    return withDirectory(directory, "model", (modelDirectory) => {
        const typeResolver = new TypeResolver(intermediateRepresentation);
        for (const type of intermediateRepresentation.types) {
            generateType({
                type,
                typeResolver,
                modelDirectory,
            });
        }
    });
}
