import { HttpEndpoint, HttpService } from "@fern-fern/ir-sdk/api";

export function isPathOnlyEndpoint(service: HttpService, endpoint: HttpEndpoint): boolean {
    if (endpoint.sdkRequest != null) {
        return false;
    }

    if (endpoint.requestBody != null) {
        return false;
    }

    if (endpoint.queryParameters.length > 0) {
        return false;
    }

    if (endpoint.headers.length > 0) {
        return false;
    }

    const hasPathParameters = service.pathParameters.length > 0 || endpoint.pathParameters.length > 0;
    if (!hasPathParameters) {
        return false;
    }

    return true;
}
