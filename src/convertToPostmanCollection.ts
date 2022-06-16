import {
    HttpAuth,
    HttpEndpoint,
    HttpMethod,
    HttpService,
    IntermediateRepresentation,
    TypeDefinition,
} from "@fern-api/api";
import {
    CollectionDefinition,
    HeaderDefinition,
    ItemDefinition,
    ItemGroupDefinition,
    RequestAuthDefinition,
    RequestDefinition,
    ResponseDefinition,
} from "postman-collection";
import { getMockBodyFromType } from "./getMockBody";

const BASE_URL_VARIABLE_NAME = "base_url";
const BASE_URL_VARIABLE = `{{${BASE_URL_VARIABLE_NAME}}}`;
const BASE_URL_DEFAULT_VAULE = "http://localhost:8080";

const APPLICATION_JSON_HEADER_DEFINITION: HeaderDefinition = {
    key: "Content-Type",
    value: "application/json",
};

export function convertToPostmanCollection(ir: IntermediateRepresentation): CollectionDefinition {
    const id = ir.workspaceName ?? "Untitled API";
    return {
        info: {
            id,
            name: id,
        },
        item: getCollectionItems(ir),
        variable: [
            {
                key: BASE_URL_VARIABLE_NAME,
                value: BASE_URL_DEFAULT_VAULE,
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
    allTypes: TypeDefinition[]
): ItemDefinition {
    let convertedEndpoint: ItemDefinition = {};
    convertedEndpoint.name = httpEndpoint.endpointId;
    convertedEndpoint.request = convertRequest(httpService, httpEndpoint, allTypes);
    if (httpEndpoint.response != null) {
        convertedEndpoint.response = [convertResponse(httpEndpoint, allTypes, convertedEndpoint.request)];
    }
    convertedEndpoint.description = httpEndpoint.docs ?? undefined;
    return convertedEndpoint;
}

function convertResponse(
    httpEndpoint: HttpEndpoint,
    allTypes: TypeDefinition[],
    convertedRequest: RequestDefinition
): ResponseDefinition {
    let convertedResponse: ResponseDefinition = {
        name: "Successful " + httpEndpoint.endpointId,
        code: 200,
        header: [APPLICATION_JSON_HEADER_DEFINITION],
        responseTime: 0,
        originalRequest: convertedRequest,
    };
    if (httpEndpoint.response != null) {
        convertedResponse.description = httpEndpoint.response.docs ?? undefined;
        convertedResponse.body = JSON.stringify(
            getMockBodyFromType(httpEndpoint.response.ok.type, allTypes),
            undefined,
            4
        );
    }
    return convertedResponse;
}

function convertRequest(
    httpService: HttpService,
    httpEndpoint: HttpEndpoint,
    allTypes: TypeDefinition[]
): RequestDefinition {
    let convertedRequest: RequestDefinition = {
        url: {
            host: [BASE_URL_VARIABLE],
            path: getPathArray(httpService.basePath, httpEndpoint.path),
        },
        header: [APPLICATION_JSON_HEADER_DEFINITION],
        method: convertHttpMethod(httpEndpoint.method),
        auth: convertAuth(httpEndpoint.auth),
    };
    if (httpEndpoint.request != null) {
        convertedRequest.description = httpEndpoint.docs ?? undefined;
        convertedRequest.body = {
            mode: "raw",
            raw: JSON.stringify(getMockBodyFromType(httpEndpoint.request.type, allTypes), undefined, 4),
        };
    }
    return convertedRequest;
}

function getPathArray(basePath: string | undefined | null, endpointPath: string) {
    const path: string[] = [];
    if (basePath != null) {
        convertPathToPostmanPathArray(basePath).forEach((part) => path.push(part));
    }
    convertPathToPostmanPathArray(endpointPath).forEach((part) => path.push(part));
    return path;
}

function convertPathToPostmanPathArray(path: string): string[] {
    return path
        .split("/")
        .map((path) => {
            if (path.startsWith("{") && path.endsWith("}")) {
                return ":" + path.substring(1, path.length - 1);
            }
            return path;
        })
        .filter((path) => path.length !== 0);
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

function convertAuth(httpAuth: HttpAuth): RequestAuthDefinition | undefined {
    return HttpAuth._visit(httpAuth, {
        bearer: () => {
            return { type: "bearer" };
        },
        none: () => {
            return undefined;
        },
        _unknown: () => {
            throw new Error("Unexpected httpAuth:" + httpAuth);
        },
    });
}
