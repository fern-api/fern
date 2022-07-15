import { HttpAuth, HttpService } from "@fern-fern/ir-model/services";

export function doesServiceHaveHeaders(service: HttpService): boolean {
    return service.headers.length > 0;
}

export function doesServiceHaveAuth(
    service: HttpService
): { hasAuth: false } | { hasAuth: true; isOptional: boolean; authType: HttpAuth } {
    let someEndpointHasAuth = false;
    let allEndpointsHaveAuth = true;
    const authTypes = new Set<HttpAuth>();
    for (const endpoint of service.endpoints) {
        if (endpoint.auth === HttpAuth.None) {
            allEndpointsHaveAuth = false;
        } else {
            someEndpointHasAuth = true;
            authTypes.add(endpoint.auth);
        }
    }

    if (!someEndpointHasAuth) {
        return { hasAuth: false };
    } else {
        return { hasAuth: true, isOptional: !allEndpointsHaveAuth };
    }
}
