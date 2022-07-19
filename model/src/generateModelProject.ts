import { assertNever } from "@fern-api/commons";
import { IntermediateRepresentation } from "@fern-fern/ir-model";
import { DependencyManager, FernTypescriptGeneratorMode, generateTypeScriptProject } from "@fern-typescript/commons";
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
                mode: "model",
            });
            return { dependencies: dependencyManager.getDependencies() };
        },
    });
}

export function generateModelFiles({
    intermediateRepresentation,
    modelDirectory,
    dependencyManager,
    mode,
}: {
    intermediateRepresentation: IntermediateRepresentation;
    modelDirectory: Directory;
    dependencyManager: DependencyManager;
    mode: Extract<FernTypescriptGeneratorMode, "client" | "server" | "model">;
}): ModelContext {
    const modelContext = new ModelContext({ modelDirectory, intermediateRepresentation });

    generateTypeFiles({ intermediateRepresentation, modelContext });
    generateErrorFiles({ intermediateRepresentation, modelContext });

    switch (mode) {
        case "model":
            break;
        case "client":
        case "server":
            generateServiceTypeFiles({
                mode,
                intermediateRepresentation,
                modelContext,
                dependencyManager,
                fernConstants: intermediateRepresentation.constants,
            });
            break;
        default:
            assertNever(mode);
    }

    return modelContext;
}
