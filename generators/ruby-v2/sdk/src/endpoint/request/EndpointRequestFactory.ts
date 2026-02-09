import { FernIr } from "@fern-fern/ir-sdk";
import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { EndpointRequest } from "./EndpointRequest.js";
import { FileUploadEndpointRequest } from "./FileUploadEndpointRequest.js";
import { ReferencedEndpointRequest } from "./ReferencedEndpointRequest.js";
import { WrappedEndpointRequest } from "./WrappedEndpointRequest.js";

export declare namespace CreateEndpointRequest {
    interface Args {
        context: SdkGeneratorContext;
        sdkRequest: FernIr.SdkRequest;
        endpoint: FernIr.HttpEndpoint;
        serviceId: FernIr.ServiceId;
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
            if (endpoint.requestBody?.type === "fileUpload") {
                return new FileUploadEndpointRequest(context, sdkRequest, endpoint, endpoint.requestBody);
            }
            return new WrappedEndpointRequest({ context, sdkRequest, serviceId, wrapper, endpoint });
        },
        justRequestBody: (value) => {
            if (value.type === "bytes") {
                return undefined;
            } else {
                return new ReferencedEndpointRequest(context, sdkRequest, endpoint, value.requestBodyType);
            }
        },
        _other: () => undefined
    });
}
