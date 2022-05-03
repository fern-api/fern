import { IntermediateRepresentation } from "@fern-api/api";
import {
    getFilePathForNamedType,
    getOrCreateDirectory,
    getOrCreateSourceFile,
    TypeResolver,
} from "@fern-typescript/commons";
import { Directory } from "ts-morph";
import { generateType } from "./types/generateType";

export function generateModelFiles({
    directory,
    intermediateRepresentation,
    typeResolver = new TypeResolver(intermediateRepresentation),
}: {
    directory: Directory;
    intermediateRepresentation: IntermediateRepresentation;
    typeResolver?: TypeResolver;
}): Directory {
    const modelDirectory = getOrCreateDirectory(directory, "model");
    for (const typeDefinition of intermediateRepresentation.types) {
        const filepath = getFilePathForNamedType({
            baseDirectory: modelDirectory,
            typeName: typeDefinition.name,
        });

        const file = getOrCreateSourceFile(modelDirectory, filepath);
        generateType({
            type: typeDefinition.shape,
            typeName: typeDefinition.name.name,
            docs: typeDefinition.docs,
            typeResolver,
            modelDirectory,
            file,
        });
    }
    return modelDirectory;
}
