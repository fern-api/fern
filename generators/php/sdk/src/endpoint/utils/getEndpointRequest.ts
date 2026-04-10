import { FernIr } from "@fern-fern/ir-sdk";
import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { EndpointRequest } from "../request/EndpointRequest.js";
import { createEndpointRequest } from "../request/EndpointRequestFactory.js";

export function getEndpointRequest({
    context,
    endpoint,
    serviceId,
    service
}: {
    context: SdkGeneratorContext;
    endpoint: FernIr.HttpEndpoint;
    serviceId: FernIr.ServiceId;
    service: FernIr.HttpService;
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
