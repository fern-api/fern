import { IntermediateRepresentation } from "@fern-api/api";
import { generateTypeScriptProject, getOrCreateDirectory, TypeResolver } from "@fern-typescript/commons";
import { generateEncoderFiles } from "@fern-typescript/encoders";
import { generateErrorFiles } from "@fern-typescript/errors";
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
        packageDependencies: {
            "@fern-typescript/service-utils": "0.0.79",
            uuid: "^8.3.2",
        },
        packageDevDependencies: {
            "@types/uuid": "^8.3.4",
        },
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
}): Promise<void> {
    const typeResolver = new TypeResolver(intermediateRepresentation);

    const modelDirectory = generateModelFiles({
        directory,
        intermediateRepresentation,
        typeResolver,
    });

    const errorsDirectory = generateErrorFiles({
        directory,
        intermediateRepresentation,
        modelDirectory,
        typeResolver,
    });

    const encodersDirectory = getOrCreateDirectory(directory, "encoders");

    const servicesDirectory = getOrCreateDirectory(directory, "services");
    for (const service of intermediateRepresentation.services.http) {
        await generateHttpService({
            service,
            servicesDirectory,
            modelDirectory,
            errorsDirectory,
            encodersDirectory,
            typeResolver,
            helperManager,
        });
    }

    for (const channel of intermediateRepresentation.services.websocket) {
        generateWebSocketChannel({
            channel,
            servicesDirectory,
            modelDirectory,
            errorsDirectory,
            encodersDirectory,
            typeResolver,
            helperManager,
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
}
