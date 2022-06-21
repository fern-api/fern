import { IntermediateRepresentation } from "@fern-api/api";
import {
    DependencyManager,
    ErrorResolver,
    GeneratedProjectSrcInfo,
    generateTypeScriptProject,
    getOrCreateDirectory,
    TypeResolver,
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
    packageVersion: string;
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
    const typeResolver = new TypeResolver(intermediateRepresentation);
    const errorResolver = new ErrorResolver(intermediateRepresentation);

    const modelContext = generateModelFiles({
        modelDirectory: directory.createDirectory("model"),
        intermediateRepresentation,
        typeResolver,
    });

    const encodersDirectory = getOrCreateDirectory(directory, "encoders");

    const servicesDirectory = getOrCreateDirectory(directory, "services");
    for (const service of intermediateRepresentation.services.http) {
        await generateHttpService({
            service,
            servicesDirectory,
            modelDirectory,
            encodersDirectory,
            typeResolver,
            errorResolver,
            helperManager,
            dependencyManager,
        });
    }

    for (const channel of intermediateRepresentation.services.websocket) {
        generateWebSocketChannel({
            channel,
            servicesDirectory,
            modelDirectory,
            encodersDirectory,
            typeResolver,
            errorResolver,
            helperManager,
            dependencyManager,
        });
    }

    await generateEncoderFiles({
        encodersDirectory,
        intermediateRepresentation,
        modelDirectory,
        servicesDirectory,
        helperManager,
        typeResolver,
    });

    return {
        dependencies: dependencyManager.getDependencies(),
    };
}
