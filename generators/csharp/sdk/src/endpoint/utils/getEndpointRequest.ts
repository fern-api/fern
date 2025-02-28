import { HttpEndpoint, ServiceId } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { EndpointRequest } from "../request/EndpointRequest";
import { createEndpointRequest } from "../request/EndpointRequestFactory";

export function getEndpointRequest({
    context,
    endpoint,
    serviceId
}: {
    context: SdkGeneratorContext;
    endpoint: HttpEndpoint;
    serviceId: ServiceId;
}): EndpointRequest | undefined {
    if (endpoint.sdkRequest == null) {
        return undefined;
    }
    return createEndpointRequest({
        context,
        endpoint,
        serviceId,
        sdkRequest: endpoint.sdkRequest
    });
}
