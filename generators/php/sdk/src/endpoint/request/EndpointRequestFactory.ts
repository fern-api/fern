import { HttpEndpoint, SdkRequest, ServiceId } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { EndpointRequest } from "./EndpointRequest";
import { ReferencedEndpointRequest } from "./ReferencedEndpointRequest";
import { WrappedEndpointRequest } from "./WrappedEndpointRequest";

export declare namespace CreateEndpointRequest {
    interface Args {
        context: SdkGeneratorContext;
        sdkRequest: SdkRequest;
        endpoint: HttpEndpoint;
        serviceId: ServiceId;
    }
}

export function createEndpointRequest({
    context,
    sdkRequest,
    endpoint,
    serviceId
}: CreateEndpointRequest.Args): EndpointRequest | undefined {
    return sdkRequest.shape._visit<EndpointRequest | undefined>({
        wrapper: (wrapper) => {
            return new WrappedEndpointRequest({
                context,
                serviceId,
                sdkRequest,
                wrapper,
                endpoint
            });
        },
        justRequestBody: (value) => {
            if (value.type === "bytes") {
                context.logger.error("Bytes requests are not supported yet");
                return undefined;
            }
            return new ReferencedEndpointRequest(context, sdkRequest, endpoint, value.requestBodyType);
        },
        _other: () => {
            throw new Error("Internal error; received unexpected request shape");
        }
    });
}
