import { HttpAuth, HttpEndpoint, HttpMethod, HttpPath, HttpService } from "@fern-fern/ir-model/services";
import { ts } from "@ts-morph/common";
import { File } from "../../../../client/types";
import { constructRequestWrapper, RequestWrapper } from "./constructRequestWrapper";
import { getReferenceToMaybeVoidType } from "./getReferenceToMaybeVoidType";

export interface ParsedClientEndpoint {
    path: HttpPath;
    method: HttpMethod;
    request: ClientEndpointRequest | undefined;
    referenceToResponse: ts.TypeNode | undefined;
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

export function parseEndpointAndGenerateEndpointModule({
    service,
    endpoint,
    file,
}: {
    service: HttpService;
    endpoint: HttpEndpoint;
    file: File;
}): ParsedClientEndpoint {
    return {
        path: endpoint.path,
        method: endpoint.method,
        request: parseRequest({ service, endpoint, file }),
        referenceToResponse: getReferenceToMaybeVoidType(endpoint.response.type, file),
    };
}

function parseRequest({
    service,
    endpoint,
    file,
}: {
    service: HttpService;
    endpoint: HttpEndpoint;
    file: File;
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

    const wrapper = constructRequestWrapper({ service, endpoint, file });

    return {
        isWrapped: true,
        auth: endpoint.auth,
        ...wrapper,
    };
}
