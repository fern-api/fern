import { IntermediateRepresentation } from "@fern-api/api";
import { generateTypeScriptProject, getOrCreateDirectory, TypeResolver } from "@fern-typescript/commons";
import { Volume } from "memfs/lib/volume";
import { Directory } from "ts-morph";
import { generateErrorFiles } from "./errors/generateErrorFiles";
import { generateTypeFiles } from "./types/generateTypeFiles";

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
    generateTypeFiles({ intermediateRepresentation, typeResolver, modelDirectory });
    generateErrorFiles({ intermediateRepresentation, typeResolver, modelDirectory });
    return modelDirectory;
}
