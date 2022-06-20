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
import { generateErrorFiles } from "./errors/generateErrorFiles";
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
            const modelDirectory = generateModelFiles({ intermediateRepresentation, typeResolver, directory });
            generateErrorFiles({ intermediateRepresentation, typeResolver, modelDirectory });
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
            modelDirectory,
            typeName: typeDefinition.name,
            typeCategory: "type",
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
