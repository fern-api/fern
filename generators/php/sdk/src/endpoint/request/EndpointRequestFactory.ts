import { GeneratorError } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { EndpointRequest } from "./EndpointRequest.js";
import { ReferencedEndpointRequest } from "./ReferencedEndpointRequest.js";
import { WrappedEndpointRequest } from "./WrappedEndpointRequest.js";

export declare namespace CreateEndpointRequest {
    interface Args {
        context: SdkGeneratorContext;
        sdkRequest: FernIr.SdkRequest;
        endpoint: FernIr.HttpEndpoint;
        service: FernIr.HttpService;
        serviceId: FernIr.ServiceId;
    }
}

export function createEndpointRequest({
    context,
    sdkRequest,
    endpoint,
    service,
    serviceId
}: CreateEndpointRequest.Args): EndpointRequest | undefined {
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
                context.logger.error("Bytes requests are not supported yet");
                return undefined;
            }
            return new ReferencedEndpointRequest(context, sdkRequest, service, endpoint, value.requestBodyType);
        },
        _other: () => {
            throw GeneratorError.internalError("Internal error; received unexpected request shape");
        }
    });
}
