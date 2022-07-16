import { HttpAuth, HttpService } from "@fern-fern/ir-model/services";

export function doesServiceHaveHeaders(service: HttpService): boolean {
    return service.headers.length > 0;
}

export function doesServiceHaveBearerAuth(
    service: HttpService
): { hasAuth: false } | { hasAuth: true; isOptional: boolean } {
    return doesServiceHaveAuth(service, HttpAuth.Bearer);
}

export function doesServiceHaveBasicAuth(
    service: HttpService
): { hasAuth: false } | { hasAuth: true; isOptional: boolean } {
    return doesServiceHaveAuth(service, HttpAuth.Basic);
}

function doesServiceHaveAuth(
    service: HttpService,
    authType: HttpAuth
): { hasAuth: false } | { hasAuth: true; isOptional: boolean } {
    let someEndpointHasAuth = false;
    let allEndpointsHaveAuth = true;
    for (const endpoint of service.endpoints) {
        if (endpoint.auth === authType) {
            someEndpointHasAuth = true;
        } else {
            allEndpointsHaveAuth = false;
        }
    }

    if (!someEndpointHasAuth) {
        return { hasAuth: false };
    } else {
        return { hasAuth: true, isOptional: !allEndpointsHaveAuth };
    }
}
