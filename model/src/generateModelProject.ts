import { IntermediateRepresentation } from "@fern-api/api";
import { generateTypeScriptProject, ModelContext, TypeResolver } from "@fern-typescript/commons";
import { generateErrorFiles } from "@fern-typescript/errors";
import { generateTypeFiles } from "@fern-typescript/types";
import { Volume } from "memfs/lib/volume";
import { Directory } from "ts-morph";

export async function generateModelProject({
    packageName,
    packageVersion,
    volume,
    intermediateRepresentation,
}: {
    packageName: string;
    packageVersion: string;
    volume: Volume;
    intermediateRepresentation: IntermediateRepresentation;
}): Promise<void> {
    const typeResolver = new TypeResolver(intermediateRepresentation);
    await generateTypeScriptProject({
        volume,
        packageName,
        packageVersion,
        generateSrc: (srcDirectory) => {
            generateModelFiles({
                intermediateRepresentation,
                typeResolver,
                modelDirectory: srcDirectory,
            });
        },
    });
}

export function generateModelFiles({
    intermediateRepresentation,
    modelDirectory,
    typeResolver,
}: {
    intermediateRepresentation: IntermediateRepresentation;
    modelDirectory: Directory;
    typeResolver: TypeResolver;
}): ModelContext {
    const modelContext = new ModelContext(modelDirectory);
    generateTypeFiles({ intermediateRepresentation, typeResolver, modelContext });
    generateErrorFiles({ intermediateRepresentation, typeResolver, modelContext });
    return modelContext;
}
