import { IntermediateRepresentation, TypeDeclaration } from "@fern-fern/ir-model";
import { HttpAuth, HttpEndpoint, HttpHeader, HttpMethod, HttpPath, HttpService } from "@fern-fern/ir-model/services";
import {
    CollectionDefinition,
    HeaderDefinition,
    ItemDefinition,
    ItemGroupDefinition,
    RequestAuthDefinition,
    RequestDefinition,
    ResponseDefinition,
} from "postman-collection";
import { getMockBodyFromTypeReference } from "./getMockBody";

const ORIGIN_VARIABLE_NAME = "origin";
const ORIGIN_VARIABLE = `{{${ORIGIN_VARIABLE_NAME}}}`;
const ORIGIN_DEFAULT_VAULE = "http://localhost:8080";

export function convertToPostmanCollection(ir: IntermediateRepresentation): CollectionDefinition {
    const id = ir.workspaceName ?? "Untitled API";
    return {
        info: {
            name: id,
        },
        item: getCollectionItems(ir),
        variable: [
            {
                key: ORIGIN_VARIABLE_NAME,
                value: ORIGIN_DEFAULT_VAULE,
                type: "string",
            },
        ],
    };
}

function getCollectionItems(ir: IntermediateRepresentation): ItemGroupDefinition[] {
    let serviceItems: ItemGroupDefinition[] = [];
    for (const httpService of ir.services.http) {
        let endpointItems: ItemDefinition[] = [];
        for (const httpEndpoint of httpService.endpoints) {
            endpointItems.push(convertEndpoint(httpEndpoint, httpService, ir.types));
        }
        const serviceItem: ItemGroupDefinition = {
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
): ItemDefinition {
    let convertedEndpoint: ItemDefinition = {};
    convertedEndpoint.name = httpEndpoint.endpointId;
    convertedEndpoint.request = convertRequest(httpService, httpEndpoint, allTypes);
    if (httpEndpoint.response != null) {
        convertedEndpoint.response = [convertResponse(httpEndpoint, allTypes, convertedEndpoint.request)];
    }
    convertedEndpoint.description = httpEndpoint.docs ?? undefined;
    convertedEndpoint["protocolProfileBehavior"] = {
        disableBodyPruning: true,
    };
    return convertedEndpoint;
}

function convertResponse(
    httpEndpoint: HttpEndpoint,
    allTypes: TypeDeclaration[],
    convertedRequest: RequestDefinition
): ResponseDefinition {
    let convertedResponse: ResponseDefinition = {
        name: "Successful " + httpEndpoint.endpointId,
        code: 200,
        header: [],
        responseTime: 0,
        originalRequest: convertedRequest,
    };
    convertedResponse["_postman_previewlanguage"] = "json";
    if (httpEndpoint.response != null) {
        convertedResponse.description = httpEndpoint.response.docs ?? undefined;
        convertedResponse.body = JSON.stringify(
            getMockBodyFromTypeReference(httpEndpoint.response.type, allTypes),
            undefined,
            4
        );
    }
    return convertedResponse;
}

function convertRequest(
    httpService: HttpService,
    httpEndpoint: HttpEndpoint,
    allTypes: TypeDeclaration[]
): RequestDefinition {
    let convertedRequest: RequestDefinition = {
        url: {
            host: [ORIGIN_VARIABLE],
            path: getPathArray(httpService.basePath, httpEndpoint.path),
        },
        header: [
            ...httpService.headers.map((header) => convertHeader(header, allTypes)),
            ...httpEndpoint.headers.map((header) => convertHeader(header, allTypes)),
        ],
        method: convertHttpMethod(httpEndpoint.method),
        auth: convertAuth(httpEndpoint.auth),
    };
    if (httpEndpoint.request != null) {
        convertedRequest.description = httpEndpoint.docs ?? undefined;
        convertedRequest.body = {
            mode: "raw",
            raw: JSON.stringify(getMockBodyFromTypeReference(httpEndpoint.request.type, allTypes), undefined, 4),
        };
        convertedRequest.body["options"] = {
            raw: {
                language: "json",
            },
        };
    }
    return convertedRequest;
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

function convertHeader(header: HttpHeader, allTypes: TypeDeclaration[]): HeaderDefinition {
    return {
        key: header.header,
        description: header.docs ?? undefined,
        type: "text",
        value: getMockBodyFromTypeReference(header.valueType, allTypes),
    } as HeaderDefinition;
}

function convertHttpMethod(httpMethod: HttpMethod): string {
    return HttpMethod._visit(httpMethod, {
        get: () => "GET",
        post: () => "POST",
        put: () => "PUT",
        patch: () => "PATCH",
        delete: () => "DELETE",
        _unknown: () => {
            throw new Error("Unexpected httpMethod: " + httpMethod);
        },
    });
}

const BASIC_AUTH_DEFINITION: RequestAuthDefinition = { type: "basic" };
const BEARER_AUTH_DEFINITION: RequestAuthDefinition = { type: "bearer" };

function convertAuth(httpAuth: HttpAuth): RequestAuthDefinition | undefined {
    return HttpAuth._visit(httpAuth, {
        basic: () => {
            return BASIC_AUTH_DEFINITION;
        },
        bearer: () => {
            return BEARER_AUTH_DEFINITION;
        },
        none: () => {
            return undefined;
        },
        _unknown: () => {
            throw new Error("Unexpected httpAuth:" + httpAuth);
        },
    });
}
