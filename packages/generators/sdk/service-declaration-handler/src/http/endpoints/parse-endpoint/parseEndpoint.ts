import { HttpEndpoint } from "@fern-fern/ir-model/services/http";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ModuleDeclaration, ts, VariableDeclarationKind } from "ts-morph";
import { constructEndpointErrors } from "./constructEndpointErrors";
import { constructRequestWrapper } from "./constructRequestWrapper";
import { getReferenceToMaybeVoidType } from "./getReferenceToMaybeVoidType";
import { ClientEndpointRequest, ParsedClientEndpoint } from "./ParsedClientEndpoint";

export function parseEndpoint({ endpoint, file }: { endpoint: HttpEndpoint; file: SdkFile }): ParsedClientEndpoint {
    const endpointModule = file.sourceFile.addModule({
        name: endpoint.name.camelCase,
        isExported: true,
    });
    file.addNamedExport(endpointModule.getName());

    const endpointUtils: ts.ObjectLiteralElementLike[] = [];

    const parsedEndpoint: ParsedClientEndpoint = {
        endpointMethodName: endpointModule.getName(),
        path: endpoint.path,
        method: endpoint.method,
        request: parseRequest({ endpoint, file, endpointModule }),
        referenceToResponse: getReferenceToMaybeVoidType(endpoint.response.type, file),
        error: constructEndpointErrors({
            endpoint,
            file,
            endpointModule,
            addEndpointUtil: (util) => {
                endpointUtils.push(util);
            },
        }),
    };

    if (endpointUtils.length > 0) {
        file.sourceFile.addVariableStatement({
            declarations: [
                {
                    name: endpointModule.getName(),
                    initializer: getTextOfTsNode(ts.factory.createObjectLiteralExpression(endpointUtils, true)),
                },
            ],
            declarationKind: VariableDeclarationKind.Const,
            isExported: true,
        });
    }

    return parsedEndpoint;
}

function parseRequest({
    endpoint,
    file,
    endpointModule,
}: {
    endpoint: HttpEndpoint;
    file: SdkFile;
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
            referenceToBody,
        };
    }

    const wrapper = constructRequestWrapper({ endpoint, file, endpointModule });

    return {
        isWrapped: true,
        ...wrapper,
    };
}
