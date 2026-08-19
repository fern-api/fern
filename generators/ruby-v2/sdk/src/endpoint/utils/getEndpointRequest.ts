import { FernIr } from "@fern-fern/ir-sdk";
import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { EndpointRequest } from "../request/EndpointRequest.js";
import { createEndpointRequest } from "../request/EndpointRequestFactory.js";

export function getEndpointRequest({
    context,
    endpoint,
    serviceId
}: {
    context: SdkGeneratorContext;
    endpoint: FernIr.HttpEndpoint;
    serviceId: FernIr.ServiceId;
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
