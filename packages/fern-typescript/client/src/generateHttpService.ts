import { HttpService } from "@fern-api/api";
import { withDirectory, withSourceFile } from "@fern-typescript/commons";
import { TypeResolver } from "@fern-typescript/model";
import { Directory } from "ts-morph";
import { addEndpointToService } from "./addEndpointToService";

export function generateHttpService({
    servicesDirectory,
    modelDirectory,
    service,
    typeResolver,
}: {
    servicesDirectory: Directory;
    modelDirectory: Directory;
    service: HttpService;
    typeResolver: TypeResolver;
}): void {
    withDirectory(
        {
            containingModule: servicesDirectory,
            name: service.name.name,
            namespaceExport: service.name.name,
        },
        (serviceDirectory) => {
            withDirectory(
                {
                    containingModule: serviceDirectory,
                    name: "endpoints",
                    namespaceExport: "Endpoints",
                },
                (endpointsDirectory) => {
                    generateService({ service, serviceDirectory, modelDirectory, endpointsDirectory, typeResolver });
                }
            );
        }
    );
}
function generateService({
    service,
    serviceDirectory,
    modelDirectory,
    endpointsDirectory,
    typeResolver,
}: {
    service: HttpService;
    serviceDirectory: Directory;
    modelDirectory: Directory;
    endpointsDirectory: Directory;
    typeResolver: TypeResolver;
}) {
    withSourceFile(
        {
            directory: serviceDirectory,
            filepath: `${service.name.name}.ts`,
        },
        (serviceFile) => {
            const serviceInterface = serviceFile.addInterface({
                name: "Client",
                isExported: true,
            });

            const serviceClass = serviceFile.addClass({
                name: serviceInterface.getName(),
                implements: [serviceInterface.getName()],
                isExported: true,
            });

            for (const endpoint of service.endpoints) {
                addEndpointToService({
                    endpoint,
                    serviceFile,
                    serviceInterface,
                    serviceClass,
                    modelDirectory,
                    endpointsDirectory,
                    typeResolver,
                });
            }
        }
    );
}
