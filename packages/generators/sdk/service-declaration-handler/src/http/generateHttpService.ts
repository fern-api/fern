import { HttpService } from "@fern-fern/ir-model/services/http";
import { getTextOfTsKeyword, getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { Scope, ts } from "ts-morph";
import { ClientConstants } from "../constants";
import { addEndpointToService } from "./endpoints/addEndpointToService";

export function generateHttpService({ service, file }: { service: HttpService; file: SdkFile }): void {
    const serviceInterface = file.sourceFile.addInterface({
        name: ClientConstants.HttpService.SERVICE_NAME,
        isExported: true,
    });

    const serviceModule = file.sourceFile.addModule({
        name: serviceInterface.getName(),
        isExported: true,
        hasDeclareKeyword: true,
    });

    const optionsInterface = serviceModule.addInterface({
        name: ClientConstants.HttpService.ServiceNamespace.Options.TYPE_NAME,
        properties: [
            {
                name: ClientConstants.HttpService.ServiceNamespace.Options.Properties.BASE_PATH,
                type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
            },
        ],
    });

    optionsInterface.addProperties(file.authSchemes.getProperties());

    const serviceClass = file.sourceFile.addClass({
        name: serviceInterface.getName(),
        implements: [serviceInterface.getName()],
        isExported: true,
    });
    maybeAddDocs(serviceClass, service.docs);

    serviceClass.addConstructor({
        parameters: [
            {
                name: ClientConstants.HttpService.PrivateMembers.OPTIONS,
                isReadonly: true,
                scope: Scope.Private,
                type: getTextOfTsNode(
                    ts.factory.createTypeReferenceNode(
                        ts.factory.createQualifiedName(
                            ts.factory.createIdentifier(serviceModule.getName()),
                            ts.factory.createIdentifier(optionsInterface.getName())
                        )
                    )
                ),
            },
        ],
    });

    for (const endpoint of service.endpoints) {
        addEndpointToService({
            endpoint,
            file,
            serviceInterface,
            serviceClass,
        });
    }
}
