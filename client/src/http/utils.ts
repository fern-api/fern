import { HttpAuth, HttpService } from "@fern-fern/ir-model/services";

export function doesServiceHaveHeaders(service: HttpService): boolean {
    return service.headers.length > 0;
}

export function doesServiceHaveAuth(service: HttpService): { hasAuth: false } | { hasAuth: true; isOptional: boolean } {
    let someEndpointHasAuth = false;
    let allEndpointsHaveAuth = true;
    for (const endpoint of service.endpoints) {
        if (endpoint.auth === HttpAuth.None) {
            allEndpointsHaveAuth = false;
        } else {
            someEndpointHasAuth = true;
        }
    }

    if (!someEndpointHasAuth) {
        return { hasAuth: false };
    } else {
        return { hasAuth: true, isOptional: !allEndpointsHaveAuth };
    }
}
