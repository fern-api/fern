import { IntermediateRepresentation } from "@fern-api/api";
import { getOrCreateDirectory, TypeResolver } from "@fern-typescript/commons";
import { generateErrorFiles } from "@fern-typescript/errors";
import { HelperManager } from "@fern-typescript/helper-manager";
import { generateModelFiles } from "@fern-typescript/model";
import { Directory } from "ts-morph";
import { generateHttpService } from "./generateHttpService";

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
    });

    const servicesDirectory = getOrCreateDirectory(directory, "services");

    for (const service of intermediateRepresentation.services.http) {
        await generateHttpService({
            service,
            servicesDirectory,
            modelDirectory,
            errorsDirectory,
            typeResolver,
            helperManager,
        });
    }
}
