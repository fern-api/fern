import { HttpAuth, HttpService } from "@fern-fern/ir-model/services";

export function doesServiceHaveHeaders(service: HttpService): boolean {
    return service.headers.length > 0;
}

export function doesServiceHaveAuth(
    service: HttpService
): { hasAuth: false } | { hasAuth: true; isOptional: boolean; authType: HttpAuth.Bearer | HttpAuth.Basic } {
    let someEndpointHasAuth = false;
    let allEndpointsHaveAuth = true;
    let authType = undefined;
    for (const endpoint of service.endpoints) {
        if (endpoint.auth === HttpAuth.None) {
            allEndpointsHaveAuth = false;
        } else {
            someEndpointHasAuth = true;
            if (authType == null) {
                authType = endpoint.auth;
            }
        }
    }

    if (!someEndpointHasAuth) {
        return { hasAuth: false };
    } else if (authType != null) {
        return { hasAuth: true, isOptional: !allEndpointsHaveAuth, authType };
    } else {
        throw new Error(
            `Encountered unexpected state. ${service.name.name} has endpoints with auth, but only found HttpAuth.None`
        );
    }
}
