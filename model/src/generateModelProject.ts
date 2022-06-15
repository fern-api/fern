import { IntermediateRepresentation } from "@fern-api/api";
import {
    generateTypeScriptProject,
    getFilePathForNamedType,
    getOrCreateDirectory,
    getOrCreateSourceFile,
    TypeResolver,
} from "@fern-typescript/commons";
import { Volume } from "memfs/lib/volume";
import { Directory } from "ts-morph";
import { generateType } from "./types/generateType";

export async function generateModelProject({
    packageName,
    packageVersion,
    volume,
    intermediateRepresentation,
    typeResolver = new TypeResolver(intermediateRepresentation),
}: {
    packageName: string;
    packageVersion: string;
    volume: Volume;
    intermediateRepresentation: IntermediateRepresentation;
    typeResolver?: TypeResolver;
}): Promise<void> {
    await generateTypeScriptProject({
        volume,
        packageName,
        packageVersion,
        generateSrc: (directory) => {
            generateModelFiles({ intermediateRepresentation, typeResolver, directory });
        },
    });
}

export function generateModelFiles({
    intermediateRepresentation,
    directory,
    typeResolver,
}: {
    intermediateRepresentation: IntermediateRepresentation;
    directory: Directory;
    typeResolver: TypeResolver;
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
