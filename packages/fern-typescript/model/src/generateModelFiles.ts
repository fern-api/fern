import { IntermediateRepresentation } from "@fern-api/api";
import { getFilePathForNamedType, withDirectory, withSourceFile } from "@fern-typescript/commons";
import { Directory } from "ts-morph";
import { generateType } from "./types/generateType";
import { TypeResolver } from "./utils/TypeResolver";

export function generateModelFiles({
    directory,
    intermediateRepresentation,
    typeResolver = new TypeResolver(intermediateRepresentation),
}: {
    directory: Directory;
    intermediateRepresentation: IntermediateRepresentation;
    typeResolver?: TypeResolver;
}): Directory {
    return withDirectory({ containingModule: directory, name: "model" }, (modelDirectory) => {
        for (const typeDefinition of intermediateRepresentation.types) {
            const filepath = getFilePathForNamedType({
                baseDirectory: modelDirectory,
                typeName: typeDefinition.name,
            });
            withSourceFile({ directory: modelDirectory, filepath }, (file) => {
                generateType({
                    type: typeDefinition.shape,
                    typeName: typeDefinition.name.name,
                    docs: typeDefinition.docs,
                    typeResolver,
                    modelDirectory,
                    file,
                });
            });
        }
    });
}
