import { HttpAuth, HttpEndpoint, HttpMethod, HttpService, IntermediateRepresentation } from "@fern-api/api";
import {
    CollectionDefinition,
    ItemDefinition,
    ItemGroupDefinition,
    RequestAuthDefinition,
    RequestDefinition,
    ResponseDefinition,
} from "postman-collection";
import urlJoin from "url-join";

export function convertToPostmanCollection(ir: IntermediateRepresentation): CollectionDefinition {
    return {
        info: {
            id: ir.workspaceName ?? "Untitled API",
        },
        item: getCollectionItems(ir),
    };
}

const BASE_URL_VARIABLE = "{{base_url}}";

function getCollectionItems(ir: IntermediateRepresentation): ItemGroupDefinition[] {
    let serviceItems: ItemGroupDefinition[] = [];
    for (const httpService of ir.services.http) {
        let endpointItems: ItemDefinition[] = [];
        for (const httpEndpoint of httpService.endpoints) {
            endpointItems.push(convertEndpoint(httpEndpoint, httpService));
        }
        const serviceItem: ItemGroupDefinition = {
            name: httpService.name.name,
            item: endpointItems,
        };
        serviceItems.push(serviceItem);
    }
    return serviceItems;
}

function convertEndpoint(httpEndpoint: HttpEndpoint, httpService: HttpService): ItemDefinition {
    let convertedEndpoint: ItemDefinition = {};
    convertedEndpoint.name = httpEndpoint.endpointId;
    convertedEndpoint.request = convertRequest(httpService, httpEndpoint);
    if (httpEndpoint.response != null) {
        convertedEndpoint.response = [convertResponse()];
    }
    return convertedEndpoint;
}

function convertResponse(): ResponseDefinition {
    return {
        code: 200,
        responseTime: 0,
    };
}

function convertRequest(httpService: HttpService, httpEndpoint: HttpEndpoint): RequestDefinition {
    let convertedRequest: RequestDefinition = {
        url: urlJoin(BASE_URL_VARIABLE, httpService.basePath, httpEndpoint.path),
        method: convertHttpMethod(httpEndpoint.method),
        auth: httpService.auth != null ? convertAuth(httpService.auth) : undefined,
    };
    if (httpEndpoint.request != null) {
        convertedRequest.description = httpEndpoint.request.docs ?? undefined;
    }
    return convertedRequest;
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

function convertAuth(httpAuth: HttpAuth): RequestAuthDefinition {
    return HttpAuth._visit(httpAuth, {
        bearer: () => {
            return { type: "bearer" };
        },
        _unknown: () => {
            throw new Error("Unexpected httpAuth:" + httpAuth);
        },
    });
}
