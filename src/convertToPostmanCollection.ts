import { IntermediateRepresentation, TypeDeclaration } from "@fern-fern/ir-model";
import { HttpAuth, HttpEndpoint, HttpHeader, HttpMethod, HttpPath, HttpService } from "@fern-fern/ir-model/services";
import {
    PostmanCollectionEndpointItem,
    PostmanCollectionSchema,
    PostmanCollectionServiceItem,
    PostmanExampleResponse,
    PostmanHeader,
    PostmanMethod,
    PostmanRequest,
    PostmanRequestAuth,
} from "@fern-fern/postman-collection-api-client/model/collection";
import { getMockBodyFromTypeReference } from "./getMockBody";

const ORIGIN_VARIABLE_NAME = "origin";
const ORIGIN_VARIABLE = `{{${ORIGIN_VARIABLE_NAME}}}`;
const ORIGIN_DEFAULT_VAULE = "http://localhost:8080";

export function convertToPostmanCollection(ir: IntermediateRepresentation): PostmanCollectionSchema {
    const id = ir.workspaceName ?? "Untitled API";
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
        ],
        item: getCollectionItems(ir),
    };
}

function getCollectionItems(ir: IntermediateRepresentation): PostmanCollectionServiceItem[] {
    let serviceItems: PostmanCollectionServiceItem[] = [];
    for (const httpService of ir.services.http) {
        let endpointItems: PostmanCollectionEndpointItem[] = [];
        for (const httpEndpoint of httpService.endpoints) {
            endpointItems.push(convertEndpoint(httpEndpoint, httpService, ir.types));
        }
        const serviceItem: PostmanCollectionServiceItem = {
            name: httpService.name.name,
            item: endpointItems,
        };
        serviceItems.push(serviceItem);
    }
    return serviceItems;
}

function convertEndpoint(
    httpEndpoint: HttpEndpoint,
    httpService: HttpService,
    allTypes: TypeDeclaration[]
): PostmanCollectionEndpointItem {
    const convertedRequest = convertRequest(httpService, httpEndpoint, allTypes);
    return {
        name: httpEndpoint.endpointId,
        request: convertedRequest,
        response: [convertResponse(httpEndpoint, allTypes, convertedRequest)],
    };
}

function convertResponse(
    httpEndpoint: HttpEndpoint,
    allTypes: TypeDeclaration[],
    convertedRequest: PostmanRequest
): PostmanExampleResponse {
    return {
        name: "Successful " + httpEndpoint.endpointId,
        code: 200,
        originalRequest: convertedRequest,
        description: httpEndpoint.response.docs ?? undefined,
        body:
            httpEndpoint.response != null
                ? JSON.stringify(getMockBodyFromTypeReference(httpEndpoint.response.type, allTypes), undefined, 4)
                : "",
        _postman_previewlanguage: "json",
    };
}

function convertRequest(
    httpService: HttpService,
    httpEndpoint: HttpEndpoint,
    allTypes: TypeDeclaration[]
): PostmanRequest {
    const hostArr = [ORIGIN_VARIABLE];
    const pathArr = getPathArray(httpService.basePath, httpEndpoint.path);
    return {
        description: httpEndpoint.docs ?? undefined,
        url: {
            raw: hostArr.concat(pathArr).join("/"),
            host: hostArr,
            path: pathArr,
        },
        header: [
            ...httpService.headers.map((header) => convertHeader(header, allTypes)),
            ...httpEndpoint.headers.map((header) => convertHeader(header, allTypes)),
        ],
        method: convertHttpMethod(httpEndpoint.method),
        auth: convertAuth(httpEndpoint.auth),
        body:
            httpEndpoint.request == null
                ? undefined
                : {
                      mode: "raw",
                      raw: JSON.stringify(
                          getMockBodyFromTypeReference(httpEndpoint.request.type, allTypes),
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

function getPathArray(basePath: string | undefined | null, endpointPath: HttpPath): string[] {
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

function splitPathString(path: string) {
    return path.split("/").filter((val) => val.length > 0 && val !== "/");
}

function convertHeader(header: HttpHeader, allTypes: TypeDeclaration[]): PostmanHeader {
    return {
        key: header.header,
        description: header.docs ?? undefined,
        type: "text",
        value: getMockBodyFromTypeReference(header.valueType, allTypes),
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

function convertAuth(httpAuth: HttpAuth): PostmanRequestAuth | undefined {
    return HttpAuth._visit<PostmanRequestAuth | undefined>(httpAuth, {
        basic: () => {
            return PostmanRequestAuth.basic();
        },
        bearer: () => {
            return PostmanRequestAuth.bearer();
        },
        none: () => {
            return undefined;
        },
        _unknown: () => {
            throw new Error("Unexpected httpAuth:" + httpAuth);
        },
    });
}
