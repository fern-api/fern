import { HttpEndpoint, HttpService, SdkRequest, ServiceId } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { EndpointRequest } from "../request/EndpointRequest";
import { ReferencedEndpointRequest } from "../request/ReferencedEndpointRequest";
import { WrappedEndpointRequest } from "../request/WrappedEndpointRequest";

export function getEndpointRequest({
    context,
    endpoint,
    serviceId,
    service
}: {
    context: SdkGeneratorContext;
    endpoint: HttpEndpoint;
    serviceId: ServiceId;
    service: HttpService;
}): EndpointRequest | undefined {
    if (endpoint.sdkRequest == null) {
        return undefined;
    }
    if (endpoint.sdkRequest.shape.type === "wrapper") {
        if (context.shouldSkipWrappedRequest({ endpoint, wrapper: endpoint.sdkRequest.shape })) {
            return undefined;
        }
    }
    return createEndpointRequest({
        context,
        endpoint,
        serviceId,
        service,
        sdkRequest: endpoint.sdkRequest
    });
}

function createEndpointRequest({
    context,
    sdkRequest,
    endpoint,
    service,
    serviceId
}: {
    context: SdkGeneratorContext;
    sdkRequest: SdkRequest;
    endpoint: HttpEndpoint;
    service: HttpService;
    serviceId: ServiceId;
}): EndpointRequest | undefined {
    return sdkRequest.shape._visit<EndpointRequest | undefined>({
        wrapper: (wrapper) => {
            return new WrappedEndpointRequest({
                context,
                serviceId,
                sdkRequest,
                wrapper,
                service,
                endpoint
            });
        },
        justRequestBody: (value) => {
            if (value.type === "bytes") {
                // TODO: Implement this.
                return undefined;
            }
            return new ReferencedEndpointRequest(context, sdkRequest, service, endpoint, value.requestBodyType);
        },
        _other: () => {
            throw new Error("Internal error; received unexpected request shape");
        }
    });
}
