import { ApiAuth, AuthScheme, IntermediateRepresentation, TypeDeclaration } from "@fern-fern/ir-model";
import {
    HttpEndpoint,
    HttpHeader,
    HttpMethod,
    HttpPath,
    HttpService,
    QueryParameter,
} from "@fern-fern/ir-model/services";
import {
    PostmanCollectionEndpointItem,
    PostmanCollectionSchema,
    PostmanCollectionServiceItem,
    PostmanExampleResponse,
    PostmanHeader,
    PostmanMethod,
    PostmanQueryParameter,
    PostmanRequest,
    PostmanRequestAuth,
    PostmanVariable,
} from "@fern-fern/postman-collection-api-client/model/collection/collection";
import { getMockBodyFromTypeReference } from "./getMockBody";

const ORIGIN_VARIABLE_NAME = "origin";
const ORIGIN_DEFAULT_VAULE = "http://localhost:8080";

export function convertToPostmanCollection(ir: IntermediateRepresentation): PostmanCollectionSchema {
    const id = ir.apiName;

    const authSchemes = filterAuthSchemes(ir.auth);
    const authHeaders = getAuthHeaders(authSchemes);

    return {
        info: {
            name: id,
            schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        },
        variable: [
            {
                key: ORIGIN_VARIABLE_NAME,
                value: ORIGIN_DEFAULT_VAULE,
                type: "string",
            },
            ...authSchemes.flatMap(getVariablesForAuthScheme),
        ],
        auth: convertAuth(authSchemes),
        item: getCollectionItems({ ir, authHeaders }),
    };
}

function filterAuthSchemes(auth: ApiAuth): AuthScheme[] {
    let hasSeenAuthorizationHeader = false;
    return auth.schemes.filter((scheme) => {
        return AuthScheme._visit(scheme, {
            basic: () => {
                if (hasSeenAuthorizationHeader) {
                    return false;
                }
                return (hasSeenAuthorizationHeader = true);
            },
            bearer: () => {
                if (hasSeenAuthorizationHeader) {
                    return false;
                }
                return (hasSeenAuthorizationHeader = true);
            },
            header: () => true,
            _unknown: () => {
                throw new Error("Unknown auth scheme: " + scheme._type);
            },
        });
    });
}

function getCollectionItems({
    ir,
    authHeaders,
}: {
    ir: IntermediateRepresentation;
    authHeaders: PostmanHeader[];
}): PostmanCollectionServiceItem[] {
    const serviceItems: PostmanCollectionServiceItem[] = [];
    for (const httpService of ir.services.http) {
        const endpointItems: PostmanCollectionEndpointItem[] = [];
        for (const httpEndpoint of httpService.endpoints) {
            endpointItems.push(convertEndpoint({ authHeaders, httpEndpoint, httpService, allTypes: ir.types }));
        }
        const serviceItem: PostmanCollectionServiceItem = {
            name: httpService.name.name,
            item: endpointItems,
        };
        serviceItems.push(serviceItem);
    }
    return serviceItems;
}

function convertEndpoint({
    authHeaders,
    httpEndpoint,
    httpService,
    allTypes,
}: {
    authHeaders: PostmanHeader[];
    httpEndpoint: HttpEndpoint;
    httpService: HttpService;
    allTypes: TypeDeclaration[];
}): PostmanCollectionEndpointItem {
    const convertedRequest = convertRequest({ authHeaders, httpService, httpEndpoint, allTypes });
    return {
        name: httpEndpoint.id,
        request: convertedRequest,
        response: [convertResponse({ httpEndpoint, allTypes, convertedRequest })],
    };
}

function convertResponse({
    httpEndpoint,
    allTypes,
    convertedRequest,
}: {
    httpEndpoint: HttpEndpoint;
    allTypes: TypeDeclaration[];
    convertedRequest: PostmanRequest;
}): PostmanExampleResponse {
    const responseBody = getMockBodyFromTypeReference({ typeReference: httpEndpoint.response.type, allTypes });
    return {
        name: "Successful " + httpEndpoint.id,
        code: 200,
        originalRequest: convertedRequest,
        description: httpEndpoint.response.docs ?? undefined,
        body: responseBody != null ? JSON.stringify(responseBody, undefined, 4) : "",
        _postman_previewlanguage: "json",
    };
}

function convertRequest({
    authHeaders,
    httpService,
    httpEndpoint,
    allTypes,
}: {
    authHeaders: PostmanHeader[];
    httpService: HttpService;
    httpEndpoint: HttpEndpoint;
    allTypes: TypeDeclaration[];
}): PostmanRequest {
    const hostArr = [getReferenceToVariable(ORIGIN_VARIABLE_NAME)];
    const pathArr = getPathArray({ basePath: httpService.basePath, endpointPath: httpEndpoint.path });
    const queryParams = getQueryParams(httpEndpoint.queryParameters);

    let rawUrl = [...hostArr, ...pathArr].join("/");
    if (queryParams.length > 0) {
        rawUrl += "?" + new URLSearchParams(queryParams.map((param) => [param.key, param.value])).toString();
    }

    return {
        description: httpEndpoint.docs ?? undefined,
        url: {
            raw: rawUrl,
            host: hostArr,
            path: pathArr,
            query: queryParams,
        },
        header: [
            ...authHeaders,
            ...httpService.headers.map((header) => convertHeader({ header, allTypes })),
            ...httpEndpoint.headers.map((header) => convertHeader({ header, allTypes })),
        ],
        method: convertHttpMethod(httpEndpoint.method),
        auth: undefined, // inherit
        body:
            httpEndpoint.request.type._type === "void"
                ? undefined
                : {
                      mode: "raw",
                      raw: JSON.stringify(
                          getMockBodyFromTypeReference({ typeReference: httpEndpoint.request.type, allTypes }),
                          undefined,
                          4
                      ),
                      options: {
                          raw: {
                              language: "json",
                          },
                      },
                  },
    };
}

function getPathArray({
    basePath,
    endpointPath,
}: {
    basePath: string | undefined | null;
    endpointPath: HttpPath;
}): string[] {
    const urlParts: string[] = [];
    if (basePath != null) {
        splitPathString(basePath).forEach((splitPart) => urlParts.push(splitPart));
    }
    if (endpointPath.head !== "/") {
        splitPathString(endpointPath.head).forEach((splitPart) => urlParts.push(splitPart));
    }
    endpointPath.parts.forEach((part) => {
        urlParts.push(`:${part.pathParameter}`);
        splitPathString(part.tail).forEach((splitPart) => urlParts.push(splitPart));
    });
    return urlParts;
}

function getQueryParams(queryParameters: readonly QueryParameter[]): PostmanQueryParameter[] {
    return queryParameters.map((queryParam) => ({
        key: queryParam.name.wireValue,
        value: "",
        description: queryParam.docs,
    }));
}

function splitPathString(path: string) {
    return path.split("/").filter((val) => val.length > 0 && val !== "/");
}

function convertHeader({ header, allTypes }: { header: HttpHeader; allTypes: TypeDeclaration[] }): PostmanHeader {
    const value = getMockBodyFromTypeReference({ typeReference: header.valueType, allTypes });
    return {
        key: header.name.wireValue,
        description: header.docs ?? undefined,
        type: "text",
        value: value != null ? JSON.stringify(value) : "",
    };
}

function convertHttpMethod(httpMethod: HttpMethod): PostmanMethod {
    return HttpMethod._visit<PostmanMethod>(httpMethod, {
        get: () => PostmanMethod.Get,
        post: () => PostmanMethod.Post,
        put: () => PostmanMethod.Put,
        patch: () => PostmanMethod.Patch,
        delete: () => PostmanMethod.Delete,
        _unknown: () => {
            throw new Error("Unexpected httpMethod: " + httpMethod);
        },
    });
}

function convertAuth(schemes: AuthScheme[]): PostmanRequestAuth | undefined {
    for (const scheme of schemes) {
        const auth = AuthScheme._visit<PostmanRequestAuth | undefined>(scheme, {
            basic: () =>
                PostmanRequestAuth.basic([
                    {
                        key: "username",
                        value: getReferenceToVariable(BASIC_AUTH_USERNAME_VARIABLE),
                        type: "string",
                    },
                    {
                        key: "password",
                        value: getReferenceToVariable(BASIC_AUTH_PASSWORD_VARIABLE),
                        type: "string",
                    },
                ]),
            bearer: () =>
                PostmanRequestAuth.bearer([
                    {
                        key: "token",
                        value: getReferenceToVariable(BEARER_AUTH_TOKEN_VARIABLE),
                        type: "string",
                    },
                ]),
            header: () => undefined,
            _unknown: () => {
                throw new Error("Unknown auth scheme: " + scheme._type);
            },
        });

        if (auth != null) {
            return auth;
        }
    }

    return undefined;
}

function getAuthHeaders(schemes: AuthScheme[]): PostmanHeader[] {
    return schemes.flatMap((scheme) =>
        AuthScheme._visit(scheme, {
            basic: () => [],
            bearer: () => [],
            header: (header) => [
                {
                    key: header.name.wireValue,
                    value: getReferenceToVariable(getVariableForAuthHeader(header)),
                    type: "string",
                    description: header.docs,
                },
            ],
            _unknown: () => {
                throw new Error("Unknown auth scheme: " + scheme._type);
            },
        })
    );
}

const BASIC_AUTH_USERNAME_VARIABLE = "username";
const BASIC_AUTH_PASSWORD_VARIABLE = "password";
const BEARER_AUTH_TOKEN_VARIABLE = "token";

function getVariablesForAuthScheme(scheme: AuthScheme): PostmanVariable[] {
    return AuthScheme._visit(scheme, {
        basic: () => [
            {
                key: BASIC_AUTH_USERNAME_VARIABLE,
                value: "",
                type: "string",
            },
            {
                key: BASIC_AUTH_PASSWORD_VARIABLE,
                value: "",
                type: "string",
            },
        ],
        bearer: () => [
            {
                key: BEARER_AUTH_TOKEN_VARIABLE,
                value: "",
                type: "string",
            },
        ],
        header: (header) => [
            {
                key: getVariableForAuthHeader(header),
                value: "",
                type: "string",
            },
        ],
        _unknown: () => {
            throw new Error("Unknown auth scheme: " + scheme._type);
        },
    });
}

function getVariableForAuthHeader(header: HttpHeader): string {
    return header.name.wireValue;
}

function getReferenceToVariable(variable: string): string {
    return `{{${variable}}}`;
}
