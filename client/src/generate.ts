import { IntermediateRepresentation } from "@fern-api/api";
import { withDirectory } from "@fern-api/typescript-commons";
import { Directory } from "ts-morph";
import { generateHttpService } from "./generateHttpService";

export function generateClientFiles({
    intermediateRepresentation,
    directory,
    modelDirectory,
    errorsDirectory,
}: {
    intermediateRepresentation: IntermediateRepresentation;
    directory: Directory;
    modelDirectory: Directory;
    errorsDirectory: Directory;
}): void {
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
