import { IntermediateRepresentation } from "@fern-api/api";
import { generateTypeScriptProject, ModelContext } from "@fern-typescript/commons";
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
    await generateTypeScriptProject({
        volume,
        packageName,
        packageVersion,
        generateSrc: (srcDirectory) => {
            generateModelFiles({
                intermediateRepresentation,
                modelDirectory: srcDirectory,
            });
        },
    });
}

export function generateModelFiles({
    intermediateRepresentation,
    modelDirectory,
}: {
    intermediateRepresentation: IntermediateRepresentation;
    modelDirectory: Directory;
}): ModelContext {
    const modelContext = new ModelContext({ modelDirectory, intermediateRepresentation });
    generateTypeFiles({ intermediateRepresentation, modelContext });
    generateErrorFiles({ intermediateRepresentation, modelContext });
    return modelContext;
}
