import { IntermediateRepresentation } from "@fern-api/api";
import { getOrCreateDirectory, TypeResolver } from "@fern-typescript/commons";
import { generateEncoderFiles } from "@fern-typescript/encoders";
import { generateErrorFiles } from "@fern-typescript/errors";
import { HelperManager } from "@fern-typescript/helper-manager";
import { generateModelFiles } from "@fern-typescript/model";
import { Directory } from "ts-morph";
import { generateHttpService } from "./http/generateHttpService";
import { generateWebSocketChannel } from "./websocket/generateWebSocketChannel";

export async function generateClientFiles({
    intermediateRepresentation,
    directory,
    helperManager,
}: {
    intermediateRepresentation: IntermediateRepresentation;
    directory: Directory;
    helperManager: HelperManager;
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
