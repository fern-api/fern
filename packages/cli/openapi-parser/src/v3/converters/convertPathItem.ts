import { Endpoint, HttpMethod } from "@fern-fern/openapi-ir-model/ir";
import { OpenAPIV3 } from "openapi-types";
import { OpenAPIV3ParserContext } from "../OpenAPIV3ParserContext";
import { getGeneratedTypeName } from "../utils/getSchemaName";
import { convertServer } from "./convertServer";
import { convertParameters } from "./endpoint/convertParameters";
import { convertRequest } from "./endpoint/convertRequest";
import { convertResponse } from "./endpoint/convertResponse";

export function convertPathItem(
    path: string,
    pathItemObject: OpenAPIV3.PathItemObject,
    document: OpenAPIV3.Document,
    context: OpenAPIV3ParserContext
): Endpoint[] {
    const endpoints: Endpoint[] = [];

    if (pathItemObject.get != null) {
        endpoints.push({
            method: HttpMethod.Get,
            path,
            ...convertOperation(pathItemObject.get, document, context),
        });
    }

    if (pathItemObject.post != null) {
        endpoints.push({
            method: HttpMethod.Post,
            path,
            ...convertOperation(pathItemObject.post, document, context),
        });
    }

    if (pathItemObject.put != null) {
        endpoints.push({
            method: HttpMethod.Put,
            path,
            ...convertOperation(pathItemObject.put, document, context),
        });
    }

    if (pathItemObject.patch != null) {
        endpoints.push({
            method: HttpMethod.Patch,
            path,
            ...convertOperation(pathItemObject.patch, document, context),
        });
    }

    if (pathItemObject.delete != null) {
        endpoints.push({
            method: HttpMethod.Patch,
            path,
            ...convertOperation(pathItemObject.delete, document, context),
        });
    }

    return endpoints;
}

function convertOperation(
    operation: OpenAPIV3.OperationObject,
    document: OpenAPIV3.Document,
    context: OpenAPIV3ParserContext
): Omit<Endpoint, "path" | "method"> {
    if (operation.operationId == null) {
        throw new Error(`Operation requires operation id: ${JSON.stringify(operation)}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isStreaming = (operation as any)["x-fern-streaming"] as boolean | undefined;
    const requestNameOverride = (operation as any)["x-request-name"] as string | undefined;
    const requestBreadcrumbs = [operation.operationId, "Request"];

    const convertedParameters = convertParameters(operation.parameters ?? [], context, requestBreadcrumbs);
    const convertedRequest =
        operation.requestBody != null
            ? convertRequest({
                  requestBody: operation.requestBody,
                  document,
                  context,
                  requestBreadcrumbs,
              })
            : undefined;

    const responseBreadcrumbs = [operation.operationId, "Response"];
    return {
        summary: operation.summary,
        operationId: operation.operationId,
        tags: operation.tags ?? [],
        pathParameters: convertedParameters.pathParameters,
        queryParameters: convertedParameters.queryParameters,
        headers: convertedParameters.headers,
        requestNameOverride: requestNameOverride ?? undefined,
        generatedRequestName: getGeneratedTypeName(requestBreadcrumbs),
        request: convertedRequest,
        response: convertResponse({ responses: operation.responses, context, responseBreadcrumbs }),
        errors: [],
        server: (operation.servers ?? []).map((server) => convertServer(server)),
        description: operation.description,
        responseIsStreaming: isStreaming ?? false,
    };
}
