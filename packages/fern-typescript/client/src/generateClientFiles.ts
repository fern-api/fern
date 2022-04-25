import { IntermediateRepresentation } from "@fern-api/api";
import { withDirectory } from "@fern-typescript/commons";
import { generateErrorFiles } from "@fern-typescript/errors";
import { generateModelFiles, TypeResolver } from "@fern-typescript/model";
import { Directory } from "ts-morph";
import { generateHttpService } from "./generateHttpService";

export function generateClientFiles({
    intermediateRepresentation,
    directory,
}: {
    intermediateRepresentation: IntermediateRepresentation;
    directory: Directory;
}): void {
    const typeResolver = new TypeResolver(intermediateRepresentation);

    const modelDirectory = generateModelFiles({
        directory,
        intermediateRepresentation,
        typeResolver,
    });

    generateErrorFiles({
        directory,
        intermediateRepresentation,
        modelDirectory,
    });

    withDirectory({ containingModule: directory, name: "services" }, (servicesDirectory) => {
        for (const service of intermediateRepresentation.services.http) {
            generateHttpService({
                service,
                servicesDirectory,
                modelDirectory,
                typeResolver,
            });
        }
    });
}
