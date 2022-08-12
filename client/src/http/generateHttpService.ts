import { HttpService } from "@fern-fern/ir-model/services";
import {
    createDirectoriesForFernFilepath,
    createSourceFileAndExportFromModule,
    DependencyManager,
    getReferenceToFernServiceUtilsType,
    getTextOfTsKeyword,
    getTextOfTsNode,
    maybeAddDocs,
} from "@fern-typescript/commons";
import { HelperManager } from "@fern-typescript/helper-manager";
import { ModelContext } from "@fern-typescript/model-context";
import { Directory, Scope, ts } from "ts-morph";
import { ClientConstants } from "../constants";
import { addServiceConstructor } from "./addServiceConstructor";
import { addServiceNamespace } from "./addServiceNamespace";
import { addEndpointToService } from "./endpoints/addEndpointToService";

export async function generateHttpService({
    servicesDirectory,
    modelContext,
    service,
    helperManager,
    dependencyManager,
}: {
    servicesDirectory: Directory;
    modelContext: ModelContext;
    service: HttpService;
    helperManager: HelperManager;
    dependencyManager: DependencyManager;
}): Promise<void> {
    const packageDirectory = createDirectoriesForFernFilepath(servicesDirectory, service.name.fernFilepath);
    const serviceFile = createSourceFileAndExportFromModule(packageDirectory, service.name.name);

    const serviceInterface = serviceFile.addInterface({
        name: service.name.name,
        isExported: true,
    });

    addServiceNamespace({ serviceFile, service, modelContext, dependencyManager });

    const serviceClass = serviceFile.addClass({
        name: service.name.name,
        implements: [service.name.name],
        isExported: true,
    });
    maybeAddDocs(serviceClass, service.docs);

    serviceClass.addProperty({
        name: ClientConstants.HttpService.PrivateMembers.BASE_URL,
        scope: Scope.Private,
        type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
    });

    serviceClass.addProperty({
        name: ClientConstants.HttpService.PrivateMembers.FETCHER,
        scope: Scope.Private,
        type: getTextOfTsNode(
            getReferenceToFernServiceUtilsType({ type: "Fetcher", dependencyManager, referencedIn: serviceFile })
        ),
    });

    if (service.headers.length > 0) {
        serviceClass.addProperty({
            name: ClientConstants.HttpService.PrivateMembers.HEADERS,
            scope: Scope.Private,
            type: getTextOfTsNode(
                ts.factory.createTypeReferenceNode(
                    ts.factory.createQualifiedName(
                        ts.factory.createIdentifier(service.name.name),
                        ts.factory.createIdentifier(ClientConstants.HttpService.ServiceNamespace.Headers.TYPE_NAME)
                    )
                )
            ),
        });
    }

    addServiceConstructor({ serviceClass, serviceDefinition: service, dependencyManager });

    for (const endpoint of service.endpoints) {
        await addEndpointToService({
            endpoint,
            serviceInterface,
            serviceClass,
            serviceDefinition: service,
            modelContext,
            helperManager,
            dependencyManager,
        });
    }
}
