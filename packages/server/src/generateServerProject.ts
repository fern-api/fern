import { IntermediateRepresentation } from "@fern-fern/ir-model";
import {
    createDirectoryAndExportFromModule,
    DependencyManager,
    GeneratedProjectSrcInfo,
    generateTypeScriptProject,
} from "@fern-typescript/commons";
import { generateModelFiles } from "@fern-typescript/model";
import { Volume } from "memfs/lib/volume";
import { Directory } from "ts-morph";
import { generateHttpService } from "./http/generateHttpService";

export async function generateServerProject({
    intermediateRepresentation,
    packageName,
    packageVersion,
    volume,
}: {
    intermediateRepresentation: IntermediateRepresentation;
    packageName: string;
    packageVersion: string | undefined;
    volume: Volume;
}): Promise<void> {
    await generateTypeScriptProject({
        volume,
        packageName,
        packageVersion,
        generateSrc: (directory) => generateServerFiles({ intermediateRepresentation, directory }),
    });
}

async function generateServerFiles({
    intermediateRepresentation,
    directory,
}: {
    intermediateRepresentation: IntermediateRepresentation;
    directory: Directory;
}): Promise<GeneratedProjectSrcInfo> {
    const dependencyManager = new DependencyManager();

    const modelContext = generateModelFiles({
        modelDirectory: createDirectoryAndExportFromModule(directory, "model"),
        intermediateRepresentation,
        dependencyManager,
        mode: "server",
    });

    const servicesDirectory = createDirectoryAndExportFromModule(directory, "services");
    for (const service of intermediateRepresentation.services.http) {
        await generateHttpService({
            service,
            servicesDirectory,
            modelContext,
            dependencyManager,
        });
    }

    return {
        dependencies: dependencyManager.getDependencies(),
    };
}
