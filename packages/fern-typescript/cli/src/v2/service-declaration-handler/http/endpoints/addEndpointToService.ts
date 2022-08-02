import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { ClassDeclaration, InterfaceDeclaration, Scope, ts } from "ts-morph";
import { File } from "../../../client/types";
import { generateEndpointMethodBody } from "./endpoint-method-body/generateEndpointMethodBody";
import { getHttpRequestParameters } from "./getHttpRequestParameters";
import { parseEndpointAndGenerateEndpointModule } from "./parse-endpoint/parseEndpointAndGenerateEndpointModule";

export function addEndpointToService({
    service,
    endpoint,
    file,
    serviceInterface,
    serviceClass,
}: {
    file: File;
    service: HttpService;
    endpoint: HttpEndpoint;
    serviceInterface: InterfaceDeclaration;
    serviceClass: ClassDeclaration;
}): void {
    const parsedEndpoint = parseEndpointAndGenerateEndpointModule({ service, endpoint, file });

    const parameters = getHttpRequestParameters(parsedEndpoint);

    const returnType = getTextOfTsNode(
        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Promise"), [
            file.externalDependencies.serviceUtils.Response.of(
                parsedEndpoint.referenceToResponse != null
                    ? parsedEndpoint.referenceToResponse
                    : ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
                parsedEndpoint.referenceToResponse != null
                    ? parsedEndpoint.referenceToResponse
                    : ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
            ),
        ])
    );

    serviceInterface.addMethod({
        name: endpoint.endpointId,
        parameters,
        returnType,
    });

    serviceClass.addMethod({
        name: endpoint.endpointId,
        scope: Scope.Public,
        isAsync: true,
        parameters,
        returnType,
        statements: generateEndpointMethodBody({ endpoint: parsedEndpoint, file }),
    });
}
