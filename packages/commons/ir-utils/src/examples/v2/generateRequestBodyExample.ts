import { assertNever } from "@fern-api/core-utils";
import { HttpEndpoint, HttpService, TypeDeclaration, TypeId, V2HttpEndpointRequest } from "@fern-api/ir-sdk";

import { generateParameterExamples } from "./generateParameterExamples";
import { getFirstExamples } from "./getFirstExamples";

export function generateRequestBodyExample({
    endpoint,
    service,
    typeDeclarations,
    skipOptionalRequestProperties
}: {
    endpoint: HttpEndpoint;
    service: HttpService;
    typeDeclarations: Record<TypeId, TypeDeclaration>;
    skipOptionalRequestProperties: boolean;
}): V2HttpEndpointRequest | undefined {
    const { pathParameters, queryParameters, headers } = generateParameterExamples({
        service,
        endpoint,
        typeDeclarations,
        skipOptionalRequestProperties
    });
    const result: V2HttpEndpointRequest = {
        endpoint: {
            method: endpoint.method,
            path: getUrlForExample(endpoint)
        },
        baseUrl: undefined,
        environment: endpoint.baseUrl,
        auth: undefined,
        pathParameters,
        queryParameters,
        headers,
        requestBody: undefined,
        docs: undefined
    };
    if (endpoint.requestBody != null) {
        switch (endpoint.requestBody.type) {
            case "bytes":
                break;
            case "fileUpload": {
                const { userExample, autoExample } = getFirstExamples(endpoint.requestBody.v2Examples);
                const example = userExample ?? autoExample;
                result.requestBody = example;
                break;
            }
            case "inlinedRequestBody": {
                const { userExample, autoExample } = getFirstExamples(endpoint.requestBody.v2Examples);
                const example = userExample ?? autoExample;
                result.requestBody = example;
                break;
            }
            case "reference": {
                const { userExample, autoExample } = getFirstExamples(endpoint.requestBody.v2Examples);
                const example = userExample ?? autoExample;
                result.requestBody = example;
                break;
            }
            default: {
                assertNever(endpoint.requestBody);
            }
        }
    }
    return result;
}

function getUrlForExample(endpoint: HttpEndpoint): string {
    const pathParameters: Record<string, string> = {};
    [...endpoint.pathParameters, ...endpoint.allPathParameters].forEach((pathParameter) => {
        const { userExample, autoExample } = getFirstExamples(pathParameter.v2Examples);
        const value = userExample ?? autoExample;
        let stringValue: string;
        if (value == null) {
            stringValue = pathParameter.name.originalName;
        } else {
            stringValue = typeof value === "string" ? value : JSON.stringify(value);
        }
        pathParameters[pathParameter.name.originalName] = stringValue;
    });
    const url =
        endpoint.fullPath.head +
        endpoint.fullPath.parts.map((pathPart) => pathParameters[pathPart.pathParameter] + pathPart.tail).join("");
    return url.startsWith("/") || url === "" ? url : `/${url}`;
}
