import { TypeDeclaration, TypeReference } from "@fern-fern/ir-model";
import {
    HttpAuth,
    HttpEndpoint,
    HttpHeader,
    HttpMethod,
    HttpPath,
    HttpRequest,
    HttpResponse,
    HttpService,
    PathParameter,
    QueryParameter,
} from "@fern-fern/ir-model/services";
import { OpenAPIV3 } from "openapi-types";
import path from "path";
import { getDeclaredTypeNameKey } from "../convertToOpenApi";
import { convertTypeReference } from "./typeConverter";

export function convertServices(
    httpServices: HttpService[],
    typesByName: Record<string, TypeDeclaration>
): OpenAPIV3.PathsObject<{}> {
    const paths: OpenAPIV3.PathsObject<{}> = {};
    httpServices.forEach((httpService) => {
        httpService.endpoints.forEach((httpEndpoint) => {
            const { fullPath, convertedHttpMethod, operationObject } = convertHttpEndpoint(
                httpEndpoint,
                httpService,
                typesByName
            );
            const pathsObject = paths[fullPath];
            if (pathsObject == null || pathsObject[convertedHttpMethod] == null) {
                const pathItemObject: OpenAPIV3.PathItemObject<{}> = {};
                pathItemObject[convertedHttpMethod] = operationObject;
                paths[fullPath] = pathItemObject;
            } else {
                pathsObject[convertedHttpMethod] = operationObject;
            }
        });
    });
    return paths;
}

interface ConvertedHttpEndpoint {
    fullPath: string;
    convertedHttpMethod: OpenAPIV3.HttpMethods;
    operationObject: OpenAPIV3.OperationObject;
}

function convertHttpEndpoint(
    httpEndpoint: HttpEndpoint,
    httpService: HttpService,
    typesByName: Record<string, TypeDeclaration>
): ConvertedHttpEndpoint {
    let endpointPath = getEndpointPath(httpEndpoint.path);
    const fullPath = path.join(httpService.basePath ?? "", endpointPath);
    const convertedHttpMethod = convertHttpMethod(httpEndpoint.method);
    const convertedPathParameters = httpEndpoint.pathParameters.map((pathParameter) =>
        convertPathParameter(pathParameter)
    );
    const convertedQueryParameters = httpEndpoint.queryParameters.map((queryParameter) =>
        convertQueryParameter(queryParameter, typesByName)
    );
    const convertedHeaders = httpEndpoint.headers.map((header) => convertHeader(header, typesByName));
    const parameters: OpenAPIV3.ParameterObject[] = [
        ...convertedPathParameters,
        ...convertedQueryParameters,
        ...convertedHeaders,
    ];
    const convertedAuth = convertAuth(httpEndpoint.auth);
    if (convertedAuth != null) {
        parameters.push(convertedAuth);
    }
    let operationObject: OpenAPIV3.OperationObject<{}> = {
        description: httpEndpoint.docs ?? undefined,
        operationId: httpEndpoint.endpointId,
        tags: [httpService.name.name],
        parameters,
        responses: { ...convertResponse(httpEndpoint.response) },
    };
    const maybeRequestBody = convertRequestBody(httpEndpoint.request, typesByName);
    if (maybeRequestBody != null) {
        operationObject.requestBody = maybeRequestBody;
    }
    return {
        fullPath,
        convertedHttpMethod,
        operationObject,
    };
}

function convertHttpMethod(httpMethod: HttpMethod): OpenAPIV3.HttpMethods {
    return HttpMethod._visit<OpenAPIV3.HttpMethods>(httpMethod, {
        get: () => {
            return OpenAPIV3.HttpMethods.GET;
        },
        post: () => {
            return OpenAPIV3.HttpMethods.POST;
        },
        put: () => {
            return OpenAPIV3.HttpMethods.PUT;
        },
        patch: () => {
            return OpenAPIV3.HttpMethods.PATCH;
        },
        delete: () => {
            return OpenAPIV3.HttpMethods.DELETE;
        },
        _unknown: () => {
            throw new Error("Encountered unknown http method: " + httpMethod);
        },
    });
}

function convertRequestBody(
    httpRequest: HttpRequest,
    typesByName: Record<string, TypeDeclaration>
): OpenAPIV3.RequestBodyObject | undefined {
    if (httpRequest.type._type === "void") {
        return undefined;
    } else {
        return {
            description: httpRequest.docs ?? undefined,
            required: isTypeReferenceOptional(httpRequest.type, typesByName),
            content: {
                "application/json": {
                    schema: convertTypeReference(httpRequest.type),
                },
            },
        };
    }
}

function convertResponse(httpResponse: HttpResponse): Record<string, OpenAPIV3.ResponseObject> {
    if (httpResponse.type._type === "void") {
        return {
            "204": {
                description: httpResponse.docs ?? "",
            },
        };
    } else {
        return {
            "200": {
                description: httpResponse.docs ?? "",
                content: {
                    "application/json": {
                        schema: convertTypeReference(httpResponse.type),
                    },
                },
            },
        };
    }
}

function convertPathParameter(pathParameter: PathParameter): OpenAPIV3.ParameterObject {
    return {
        name: pathParameter.key,
        in: "path",
        description: pathParameter.docs ?? undefined,
        required: true,
        schema: convertTypeReference(pathParameter.valueType),
    };
}

function convertQueryParameter(
    queryParameter: QueryParameter,
    typesByName: Record<string, TypeDeclaration>
): OpenAPIV3.ParameterObject {
    return {
        name: queryParameter.key,
        in: "query",
        description: queryParameter.docs ?? undefined,
        required: isTypeReferenceOptional(queryParameter.valueType, typesByName),
        schema: convertTypeReference(queryParameter.valueType),
    };
}

function convertHeader(
    httpHeader: HttpHeader,
    typesByName: Record<string, TypeDeclaration>
): OpenAPIV3.ParameterObject {
    return {
        name: httpHeader.header,
        in: "header",
        description: httpHeader.docs ?? undefined,
        required: isTypeReferenceOptional(httpHeader.valueType, typesByName),
        schema: convertTypeReference(httpHeader.valueType),
    };
}

function convertAuth(httpAuth: HttpAuth): OpenAPIV3.ParameterObject | undefined {
    return HttpAuth._visit<OpenAPIV3.ParameterObject | undefined>(httpAuth, {
        basic: () => {
            return {
                name: "Authorization",
                in: "header",
                required: true,
                schema: {
                    type: "string",
                },
            };
        },
        bearer: () => {
            return {
                name: "Authorization",
                in: "header",
                required: true,
                schema: {
                    type: "string",
                },
            };
        },
        none: () => undefined,
        _unknown: () => {
            throw new Error("Encountered unknown httpAuth: " + httpAuth);
        },
    });
}

function getEndpointPath(httpPath: HttpPath): string {
    let endpointPath = httpPath.head;
    for (const httpPathPart of httpPath.parts) {
        endpointPath += `{${httpPathPart.pathParameter}}${httpPathPart.tail}`;
    }
    return endpointPath;
}

function isTypeReferenceOptional(typeReference: TypeReference, typesByName: Record<string, TypeDeclaration>): boolean {
    if (typeReference._type === "container" && typeReference.container._type === "optional") {
        return true;
    } else if (typeReference._type === "named") {
        const key = getDeclaredTypeNameKey(typeReference);
        const typeDeclaration = typesByName[key];
        if (typeDeclaration == null) {
            throw new Error("Encountered non-existent type: " + typeReference);
        }
        if (typeDeclaration.shape._type === "alias") {
            return isTypeReferenceOptional(typeDeclaration.shape.aliasOf, typesByName);
        }
    }
    return false;
}
