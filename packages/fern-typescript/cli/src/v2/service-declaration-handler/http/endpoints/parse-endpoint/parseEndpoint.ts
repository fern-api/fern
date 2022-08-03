import { HttpAuth, HttpEndpoint, HttpMethod, HttpPath, HttpService } from "@fern-fern/ir-model/services";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { ts } from "@ts-morph/common";
import { camelCase } from "lodash-es";
import { ModuleDeclaration, VariableDeclarationKind } from "ts-morph";
import { File } from "../../../../client/types";
import { constructEndpointErrors } from "./constructEndpointErrors";
import { constructRequestWrapper, RequestWrapper } from "./constructRequestWrapper";
import { getReferenceToMaybeVoidType } from "./getReferenceToMaybeVoidType";

export interface ParsedClientEndpoint {
    endpointMethodName: string;
    path: HttpPath;
    method: HttpMethod;
    request: ClientEndpointRequest | undefined;
    referenceToResponse: ts.TypeNode | undefined;
    referenceToError: ts.TypeNode;
}

export type ClientEndpointRequest = ClientEndpointRequest.Wrapped | ClientEndpointRequest.NotWrapped;

export declare namespace ClientEndpointRequest {
    export interface Wrapped extends Base, RequestWrapper {
        isWrapped: true;
    }

    export interface NotWrapped extends Base {
        isWrapped: false;
        referenceToBody: ts.TypeNode;
    }

    export interface Base {
        auth: HttpAuth;
    }
}

export function parseEndpoint({
    service,
    endpoint,
    file,
}: {
    service: HttpService;
    endpoint: HttpEndpoint;
    file: File;
}): ParsedClientEndpoint {
    const endpointMethodName = camelCase(endpoint.endpointId);

    const endpointModule = file.sourceFile.addModule({
        name: endpointMethodName,
        isExported: true,
    });

    const endpointUtils: ts.ObjectLiteralElementLike[] = [];

    const parsedEndpoint = {
        endpointMethodName,
        path: endpoint.path,
        method: endpoint.method,
        request: parseRequest({ service, endpoint, file, endpointModule }),
        referenceToResponse: getReferenceToMaybeVoidType(endpoint.response.type, file),
        referenceToError: constructEndpointErrors({ service, endpoint, file, endpointModule, endpointUtils }),
    };

    file.sourceFile.addVariableStatement({
        declarations: [
            {
                name: endpointMethodName,
                initializer: getTextOfTsNode(ts.factory.createObjectLiteralExpression(endpointUtils, true)),
            },
        ],
        declarationKind: VariableDeclarationKind.Const,
        isExported: true,
    });

    return parsedEndpoint;
}

function parseRequest({
    service,
    endpoint,
    file,
    endpointModule,
}: {
    service: HttpService;
    endpoint: HttpEndpoint;
    file: File;
    endpointModule: ModuleDeclaration;
}): ClientEndpointRequest | undefined {
    if (
        endpoint.pathParameters.length === 0 &&
        endpoint.queryParameters.length === 0 &&
        endpoint.headers.length === 0
    ) {
        const referenceToBody = getReferenceToMaybeVoidType(endpoint.request.type, file);
        if (referenceToBody == null) {
            return undefined;
        }

        return {
            isWrapped: false,
            auth: endpoint.auth,
            referenceToBody,
        };
    }

    const wrapper = constructRequestWrapper({ service, endpoint, file, endpointModule });

    return {
        isWrapped: true,
        auth: endpoint.auth,
        ...wrapper,
    };
}
