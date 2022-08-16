import { HttpEndpoint, HttpService } from "@fern-fern/ir-model/services";
import { File } from "@fern-typescript/declaration-handler";
import { ModuleDeclaration } from "ts-morph";
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
    const endpointModule = file.sourceFile.addModule({
        name: endpoint.name.camelCase,
        isExported: true,
    });

    return {
        endpointMethodName: endpointModule.getName(),
        path: endpoint.path,
        method: endpoint.method,
        request: parseRequest({ service, endpoint, file, endpointModule }),
        referenceToResponse: getReferenceToMaybeVoidType(endpoint.response.type, file),
        error: constructEndpointErrors({
            service,
            endpoint,
            file,
            endpointModule,
        }),
    };
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
            referenceToBody,
        };
    }

    const wrapper = constructRequestWrapper({ service, endpoint, file, endpointModule });

    return {
        isWrapped: true,
        ...wrapper,
    };
}
