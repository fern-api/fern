import { IntermediateRepresentation } from "@fern-api/api";
import { withDirectory } from "@fern-api/typescript-commons";
import { generateErrorFiles } from "@fern-api/typescript-errors";
import { generateModelFiles } from "@fern-api/typescript-model";
import { Directory } from "ts-morph";
import { generateHttpService } from "./generateHttpService";

export function generateClientFiles({
    intermediateRepresentation,
    directory,
}: {
    intermediateRepresentation: IntermediateRepresentation;
    directory: Directory;
}): void {
    const modelDirectory = generateModelFiles({
        directory,
        intermediateRepresentation,
    });

    const errorsDirectory = generateErrorFiles({
        directory,
        intermediateRepresentation,
        modelDirectory,
    });

    withDirectory(directory, "services", (servicesDirectory) => {
        for (const service of intermediateRepresentation.services.http) {
            generateHttpService({
                service,
                servicesDirectory,
                modelDirectory,
                errorsDirectory,
            });
        }
    });
}
