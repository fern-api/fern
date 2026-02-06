import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { BytesRequest } from "../request/BytesRequest.js";
import { EndpointRequest } from "../request/EndpointRequest.js";
import { ReferencedEndpointRequest } from "../request/ReferencedEndpointRequest.js";
import { WrappedEndpointRequest } from "../request/WrappedEndpointRequest.js";

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
    sdkRequest: FernIr.SdkRequest;
    endpoint: FernIr.HttpEndpoint;
    service: FernIr.HttpService;
    serviceId: FernIr.ServiceId;
}): EndpointRequest | undefined {
    switch (sdkRequest.shape.type) {
        case "wrapper":
            return new WrappedEndpointRequest({
                context,
                serviceId,
                sdkRequest,
                wrapper: sdkRequest.shape,
                service,
                endpoint
            });
        case "justRequestBody":
            if (sdkRequest.shape.value.type === "bytes") {
                return new BytesRequest(context, sdkRequest, service, endpoint);
            }
            return new ReferencedEndpointRequest(
                context,
                sdkRequest,
                service,
                endpoint,
                sdkRequest.shape.value.requestBodyType
            );
        default:
            assertNever(sdkRequest.shape);
    }
}
