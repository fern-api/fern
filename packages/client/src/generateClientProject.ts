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
import { generateWebSocketChannel } from "./websocket/generateWebSocketChannel";

export async function generateClientProject({
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
        generateSrc: (directory) => generateClientFiles({ intermediateRepresentation, directory }),
    });
}

async function generateClientFiles({
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
        mode: "client",
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

    for (const channel of intermediateRepresentation.services.websocket) {
        generateWebSocketChannel({
            channel,
            servicesDirectory,
            modelContext,
            dependencyManager,
        });
    }

    return {
        dependencies: dependencyManager.getDependencies(),
    };
}
