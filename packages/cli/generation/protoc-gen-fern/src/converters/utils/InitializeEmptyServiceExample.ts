import { V2HttpEndpointExample, V2EndpointLocationHttpMethod, FernIr } from "@fern-api/ir-sdk";

export function initializeEmptyServiceExample(): V2HttpEndpointExample {
    return {
        request: {
            endpoint: {
                method: V2EndpointLocationHttpMethod.Post,
                path: ""
            },
            baseUrl: undefined,
            environment: undefined,
            auth: undefined,
            headers: undefined,
            docs: undefined,
            pathParameters: undefined,
            queryParameters: undefined,
            requestBody: undefined
        },
        response: {
            statusCode: 200,
            body: FernIr.V2HttpEndpointResponseBody.json({}),
            docs: undefined
        },
            codeSamples: []
    }
}