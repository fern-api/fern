import { Endpoint, EndpointSdkName, HttpMethod } from "@fern-fern/openapi-ir-model/ir";
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
        endpoints.push(
            convertOperation({
                httpMethod: HttpMethod.Get,
                path,
                operation: pathItemObject.get,
                pathItemParameters: pathItemObject.parameters,
                document,
                context,
            })
        );
    }

    if (pathItemObject.post != null) {
        endpoints.push(
            convertOperation({
                httpMethod: HttpMethod.Post,
                path,
                operation: pathItemObject.post,
                pathItemParameters: pathItemObject.parameters,
                document,
                context,
            })
        );
    }

    if (pathItemObject.put != null) {
        endpoints.push(
            convertOperation({
                httpMethod: HttpMethod.Put,
                path,
                operation: pathItemObject.put,
                pathItemParameters: pathItemObject.parameters,
                document,
                context,
            })
        );
    }

    if (pathItemObject.patch != null) {
        endpoints.push(
            convertOperation({
                httpMethod: HttpMethod.Patch,
                path,
                operation: pathItemObject.patch,
                pathItemParameters: pathItemObject.parameters,
                document,
                context,
            })
        );
    }

    if (pathItemObject.delete != null) {
        endpoints.push(
            convertOperation({
                httpMethod: HttpMethod.Delete,
                path,
                operation: pathItemObject.delete,
                pathItemParameters: pathItemObject.parameters,
                document,
                context,
            })
        );
    }

    return endpoints;
}

function convertOperation({
    path,
    httpMethod,
    operation,
    pathItemParameters,
    document,
    context,
}: {
    path: string;
    httpMethod: HttpMethod;
    operation: OpenAPIV3.OperationObject;
    pathItemParameters: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[] | undefined;
    document: OpenAPIV3.Document;
    context: OpenAPIV3ParserContext;
}): Endpoint {
    const sdkName = maybeGetSdkName(operation);

    const baseBreadcrumbs: string[] = [];
    if (sdkName == null && operation.operationId == null) {
        throw new Error(`${httpMethod} ${path} must specify either operationId or x-fern-sdk-method-name`);
    } else if (sdkName != null) {
        if (sdkName.groupName != null) {
            baseBreadcrumbs.push(sdkName.groupName);
        }
        baseBreadcrumbs.push(sdkName.methodName);
    } else if (operation.operationId != null) {
        baseBreadcrumbs.push(operation.operationId);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isStreaming = (operation as any)["x-fern-streaming"] as boolean | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestNameOverride = (operation as any)["x-request-name"] as string | undefined;
    const requestBreadcrumbs = [...baseBreadcrumbs, "Request"];

    const endpointParameters = [...(operation.parameters ?? []), ...(pathItemParameters ?? [])];
    const convertedParameters = convertParameters(endpointParameters, context, requestBreadcrumbs);
    let convertedRequest =
        operation.requestBody != null
            ? convertRequest({
                  requestBody: operation.requestBody,
                  document,
                  context,
                  requestBreadcrumbs,
              })
            : undefined;

    // if request has query params and body is not an object, then use `Body`
    if (
        convertedParameters.queryParameters.length > 0 &&
        convertedRequest != null &&
        convertedRequest.type === "json" &&
        convertedRequest.schema.type !== "object" &&
        operation.requestBody != null
    ) {
        convertedRequest = convertRequest({
            requestBody: operation.requestBody,
            document,
            context,
            requestBreadcrumbs: [...requestBreadcrumbs, "Body"],
        });
    }

    const responseBreadcrumbs = [...baseBreadcrumbs, "Response"];
    return {
        path,
        method: httpMethod,
        summary: operation.summary,
        operationId: operation.operationId,
        tags: operation.tags ?? [],
        sdkName,
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
        authed: isEndpointAuthed(operation, document),
    };
}

function maybeGetSdkName(operation: OpenAPIV3.OperationObject): EndpointSdkName | undefined {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sdkMethodName = (operation as any)["x-fern-sdk-method-name"] as string | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sdkGroupName = (operation as any)["x-fern-sdk-group-name"] as string | undefined;
    if (sdkMethodName != null) {
        return {
            groupName: sdkGroupName,
            methodName: sdkMethodName,
        };
    }
    return undefined;
}

function isEndpointAuthed(operation: OpenAPIV3.OperationObject, document: OpenAPIV3.Document): boolean {
    if (operation.security != null) {
        return Object.keys(operation.security).length >= 0;
    }
    if (document.security != null) {
        return Object.keys(document.security).length >= 0;
    }
    return false;
}
