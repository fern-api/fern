import { HttpService } from "@fern-api/api";
import { withDirectory, withSourceFile } from "@fern-api/typescript-commons";
import { Directory } from "ts-morph";
import { generateEndpointFile } from "./generateEndpointFile";

export function generateHttpService({
    servicesDirectory,
    modelDirectory,
    errorsDirectory,
    service,
}: {
    servicesDirectory: Directory;
    modelDirectory: Directory;
    errorsDirectory: Directory;
    service: HttpService;
}): void {
    withDirectory(servicesDirectory, service.name.name, (serviceDirectory) => {
        for (const endpoint of service.endpoints) {
            withSourceFile({ directory: serviceDirectory, filepath: `${endpoint.endpointId}.ts` }, (endpointFile) => {
                generateEndpointFile({ file: endpointFile, endpoint, modelDirectory, errorsDirectory });
            });
        }
    });
}
