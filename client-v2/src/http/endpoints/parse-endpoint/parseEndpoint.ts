import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { File } from "@fern-typescript/declaration-handler";
import { camelCase } from "lodash-es";
import { ModuleDeclaration, ts, VariableDeclarationKind } from "ts-morph";
import { constructEndpointErrors } from "./constructEndpointErrors";
import { constructRequestWrapper } from "./constructRequestWrapper";
import { getReferenceToMaybeVoidType } from "./getReferenceToMaybeVoidType";
import { ClientEndpointRequest, ParsedClientEndpoint } from "./ParsedClientEndpoint";

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
        error: constructEndpointErrors({
            service,
            endpoint,
            file,
            endpointModule,
            addEndpointUtil: (util) => {
                endpointUtils.push(util);
            },
        }),
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
