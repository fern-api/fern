import { Endpoint, HttpMethod } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { convertServer } from "./convertServer";
import { convertParameters } from "./endpoint/convertParameters";
import { convertRequest } from "./endpoint/convertRequest";
import { convertResponse } from "./endpoint/convertResponse";

export function convertPathItem(
    path: string,
    pathItemObject: OpenAPIV3.PathItemObject,
    document: OpenAPIV3.Document
): Endpoint[] {
    const endpoints: Endpoint[] = [];

    if (pathItemObject.get != null) {
        endpoints.push({
            method: HttpMethod.Get,
            path,
            ...convertOperation(pathItemObject.get, document),
        });
    }

    if (pathItemObject.post != null) {
        endpoints.push({
            method: HttpMethod.Post,
            path,
            ...convertOperation(pathItemObject.post, document),
        });
    }

    if (pathItemObject.put != null) {
        endpoints.push({
            method: HttpMethod.Put,
            path,
            ...convertOperation(pathItemObject.put, document),
        });
    }

    if (pathItemObject.patch != null) {
        endpoints.push({
            method: HttpMethod.Patch,
            path,
            ...convertOperation(pathItemObject.patch, document),
        });
    }

    if (pathItemObject.delete != null) {
        endpoints.push({
            method: HttpMethod.Patch,
            path,
            ...convertOperation(pathItemObject.delete, document),
        });
    }

    return endpoints;
}

function convertOperation(
    operation: OpenAPIV3.OperationObject,
    document: OpenAPIV3.Document
): Omit<Endpoint, "path" | "method"> {
    const convertedParameters = convertParameters(operation.parameters ?? []);
    return {
        summary: operation.summary,
        operationId: operation.operationId,
        tags: operation.tags ?? [],
        pathParameters: convertedParameters.pathParameters,
        queryParameters: convertedParameters.queryParameters,
        headers: convertedParameters.headers,
        requestName: undefined,
        request:
            operation.requestBody != null
                ? convertRequest({
                      requestBody: operation.requestBody,
                      document,
                  })
                : undefined,
        response: convertResponse({ responses: operation.responses }),
        errors: [],
        server: (operation.servers ?? []).map((server) => convertServer(server)),
        description: operation.description,
    };
}
