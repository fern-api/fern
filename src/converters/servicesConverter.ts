import { ErrorDeclaration, FernConstants, Type, TypeDeclaration, TypeReference } from "@fern-fern/ir-model";
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
    ResponseError,
    ResponseErrors,
} from "@fern-fern/ir-model/services";
import { OpenAPIV3 } from "openapi-types";
import path from "path";
import { getDeclaredTypeNameKey } from "../convertToOpenApi";
import { convertTypeReference, getReferenceFromDeclaredTypeName } from "./typeConverter";

export function convertServices(
    httpServices: HttpService[],
    typesByName: Record<string, TypeDeclaration>,
    errorsByName: Record<string, ErrorDeclaration>,
    fernConstants: FernConstants
): OpenAPIV3.PathsObject<{}> {
    const paths: OpenAPIV3.PathsObject<{}> = {};
    httpServices.forEach((httpService) => {
        httpService.endpoints.forEach((httpEndpoint) => {
            const { fullPath, convertedHttpMethod, operationObject } = convertHttpEndpoint(
                httpEndpoint,
                httpService,
                typesByName,
                errorsByName,
                fernConstants
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
    typesByName: Record<string, TypeDeclaration>,
    errorsByName: Record<string, ErrorDeclaration>,
    fernConstants: FernConstants
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
        responses: {
            ...convertResponse(httpEndpoint.response, httpEndpoint.errors, errorsByName, typesByName, fernConstants),
        },
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

function convertResponse(
    httpResponse: HttpResponse,
    responseErrors: ResponseErrors,
    errorsByName: Record<string, ErrorDeclaration>,
    typesByName: Record<string, TypeDeclaration>,
    fernConstants: FernConstants
): Record<string, OpenAPIV3.ResponseObject> {
    const responseByStatusCode: Record<string, OpenAPIV3.ResponseObject> = {};
    if (httpResponse.type._type === "void") {
        responseByStatusCode["204"] = {
            description: httpResponse.docs ?? "",
        };
    } else {
        responseByStatusCode["200"] = {
            description: httpResponse.docs ?? "",
            content: {
                "application/json": {
                    schema: convertTypeReference(httpResponse.type),
                },
            },
        };
    }
    const errorInfoByStatusCode: Record<string, ErrorInfo[]> = getErrorInfoByStatusCode(responseErrors, errorsByName);
    for (const statusCode of Object.keys(errorInfoByStatusCode)) {
        const errorInfos = errorInfoByStatusCode[statusCode];
        if (errorInfos == null || errorInfos.length === 0) {
            continue;
        }
        responseByStatusCode[statusCode] = {
            description: "",
            content: {
                "application/json": {
                    schema: {
                        oneOf: errorInfos.map((errorInfo) =>
                            getErrorInfoOpenApiSchema(errorInfo, typesByName, fernConstants)
                        ),
                    },
                },
            },
        };
    }
    return responseByStatusCode;
}

function typeIsObject(type: Type, typesByName: Record<string, TypeDeclaration>): boolean {
    if (type._type === "object") {
        return true;
    } else if (type._type === "alias") {
        return typeReferenceIsObject(type.aliasOf, typesByName);
    }
    return false;
}

function typeReferenceIsObject(typeReference: TypeReference, typesByName: Record<string, TypeDeclaration>): boolean {
    if (typeReference._type === "named") {
        const key = getDeclaredTypeNameKey(typeReference);
        const typeDeclaration = typesByName[key];
        if (typeDeclaration == null) {
            return false;
        }
        return typeIsObject(typeDeclaration.shape, typesByName);
    }
    return false;
}

function getErrorInfoOpenApiSchema(
    errorInfo: ErrorInfo,
    typesByName: Record<string, TypeDeclaration>,
    fernConstants: FernConstants
): OpenAPIV3.SchemaObject {
    const discriminantValue = errorInfo.responseError.discriminantValue;
    const errorTypeRef = getReferenceFromDeclaredTypeName(errorInfo.errorDeclaration.name);
    const description = errorInfo.responseError.docs ?? undefined;
    const discriminatorProperties: Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject> = {};
    discriminatorProperties[fernConstants.errorDiscriminant] = {
        type: "string",
        enum: [errorInfo.responseError.discriminantValue],
    };
    if (typeIsObject(errorInfo.errorDeclaration.type, typesByName)) {
        return {
            type: "object",
            description,
            allOf: [
                {
                    type: "object",
                    properties: discriminatorProperties,
                },
                {
                    $ref: errorTypeRef,
                },
            ],
        };
    } else {
        discriminatorProperties[discriminantValue] = {
            $ref: errorTypeRef,
        };
        return {
            type: "object",
            description,
            properties: discriminatorProperties,
        };
    }
}

type ErrorInfo = {
    responseError: ResponseError;
    errorDeclaration: ErrorDeclaration;
};

function getErrorInfoByStatusCode(
    responseErrors: ResponseErrors,
    errorsByName: Record<string, ErrorDeclaration>
): Record<string, ErrorInfo[]> {
    const errorInfoByStatusCode: Record<string, ErrorInfo[]> = {};
    for (const responseError of responseErrors) {
        const errorDeclaration = errorsByName[getDeclaredTypeNameKey(responseError.error)];
        if (errorDeclaration == null) {
            throw new Error("Encountered undefined error declaration: " + responseError.error);
        } else if (errorDeclaration.http == null) {
            throw new Error("Encountered error with undefined http config: " + responseError.error);
        }
        const statusCode = errorDeclaration.http.statusCode;
        const statusCodeErrorInfo = errorInfoByStatusCode[statusCode];
        if (statusCodeErrorInfo == null) {
            errorInfoByStatusCode[statusCode] = [{ responseError, errorDeclaration }];
        } else {
            statusCodeErrorInfo.push({ responseError, errorDeclaration });
        }
    }
    return errorInfoByStatusCode;
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
