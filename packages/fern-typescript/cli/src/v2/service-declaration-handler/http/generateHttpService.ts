import { HttpService } from "@fern-fern/ir-model/services";
import { getTextOfTsKeyword, maybeAddDocs } from "@fern-typescript/commons";
import { Scope, ts } from "ts-morph";
import { File } from "../../client/types";
import { ClientConstants } from "../constants";
import { addServiceConstructor } from "./addServiceConstructor";
import { addServiceNamespace } from "./addServiceNamespace";
import { addEndpointToService } from "./endpoints/addEndpointToService";

export function generateHttpService({ service, file }: { service: HttpService; file: File }): void {
    const serviceInterface = file.sourceFile.addInterface({
        name: "Client",
        isExported: true,
    });

    const serviceModule = addServiceNamespace({
        moduleName: serviceInterface.getName(),
        file,
    });

    const serviceClass = file.sourceFile.addClass({
        name: serviceInterface.getName(),
        implements: [serviceInterface.getName()],
        isExported: true,
    });
    maybeAddDocs(serviceClass, service.docs);

    serviceClass.addProperty({
        name: ClientConstants.HttpService.PrivateMembers.BASE_URL,
        scope: Scope.Private,
        type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
    });

    addServiceConstructor({ serviceClass, serviceModule, serviceDefinition: service, file });

    for (const endpoint of service.endpoints) {
        addEndpointToService({
            service,
            endpoint,
            file,
            serviceInterface,
            serviceClass,
        });
    }
}
