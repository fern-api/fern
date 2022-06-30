import { IntermediateRepresentation } from "@fern-fern/ir-model";
import {
    createDirectoryAndExportFromModule,
    DependencyManager,
    GeneratedProjectSrcInfo,
    generateTypeScriptProject,
} from "@fern-typescript/commons";
import { generateEncoderFiles } from "@fern-typescript/encoders";
import { HelperManager } from "@fern-typescript/helper-manager";
import { generateModelFiles } from "@fern-typescript/model";
import { Volume } from "memfs/lib/volume";
import { Directory } from "ts-morph";
import { generateHttpService } from "./http/generateHttpService";
import { generateWebSocketChannel } from "./websocket/generateWebSocketChannel";

export async function generateClientProject({
    intermediateRepresentation,
    helperManager,
    packageName,
    packageVersion,
    volume,
}: {
    intermediateRepresentation: IntermediateRepresentation;
    helperManager: HelperManager;
    packageName: string;
    packageVersion: string | undefined;
    volume: Volume;
}): Promise<void> {
    await generateTypeScriptProject({
        volume,
        packageName,
        packageVersion,
        generateSrc: (directory) => generateClientFiles({ intermediateRepresentation, helperManager, directory }),
    });
}

async function generateClientFiles({
    intermediateRepresentation,
    helperManager,
    directory,
}: {
    intermediateRepresentation: IntermediateRepresentation;
    helperManager: HelperManager;
    directory: Directory;
}): Promise<GeneratedProjectSrcInfo> {
    const dependencyManager = new DependencyManager();

    const modelContext = generateModelFiles({
        modelDirectory: createDirectoryAndExportFromModule(directory, "model"),
        intermediateRepresentation,
        dependencyManager,
    });

    const servicesDirectory = createDirectoryAndExportFromModule(directory, "services");
    for (const service of intermediateRepresentation.services.http) {
        await generateHttpService({
            service,
            servicesDirectory,
            modelContext,
            helperManager,
            dependencyManager,
        });
    }

    for (const channel of intermediateRepresentation.services.websocket) {
        generateWebSocketChannel({
            channel,
            servicesDirectory,
            modelContext,
            helperManager,
            dependencyManager,
        });
    }

    await generateEncoderFiles({
        intermediateRepresentation,
        modelContext,
        servicesDirectory,
        helperManager,
    });

    return {
        dependencies: dependencyManager.getDependencies(),
    };
}
