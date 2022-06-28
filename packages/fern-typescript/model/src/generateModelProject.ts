import { IntermediateRepresentation } from "@fern-fern/ir-model";
import { DependencyManager, generateTypeScriptProject } from "@fern-typescript/commons";
import { generateErrorFiles } from "@fern-typescript/errors";
import { ModelContext } from "@fern-typescript/model-context";
import { generateServiceTypeFiles } from "@fern-typescript/service-types";
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
    packageVersion: string | undefined;
    volume: Volume;
    intermediateRepresentation: IntermediateRepresentation;
}): Promise<void> {
    await generateTypeScriptProject({
        volume,
        packageName,
        packageVersion,
        generateSrc: (srcDirectory) => {
            const dependencyManager = new DependencyManager();
            generateModelFiles({
                intermediateRepresentation,
                modelDirectory: srcDirectory,
                dependencyManager,
            });
            return { dependencies: dependencyManager.getDependencies() };
        },
    });
}

export function generateModelFiles({
    intermediateRepresentation,
    modelDirectory,
    dependencyManager,
}: {
    intermediateRepresentation: IntermediateRepresentation;
    modelDirectory: Directory;
    dependencyManager: DependencyManager;
}): ModelContext {
    const modelContext = new ModelContext({ modelDirectory, intermediateRepresentation });

    generateTypeFiles({ intermediateRepresentation, modelContext });
    generateErrorFiles({ intermediateRepresentation, modelContext });
    generateServiceTypeFiles({ intermediateRepresentation, modelContext, dependencyManager });

    return modelContext;
}
