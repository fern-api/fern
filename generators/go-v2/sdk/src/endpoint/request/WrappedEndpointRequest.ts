import { go } from "@fern-api/go-ast";

import { HttpEndpoint, HttpService, SdkRequest, SdkRequestWrapper, ServiceId } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { EndpointRequest } from "./EndpointRequest";

export declare namespace WrappedEndpointRequest {
    interface Args {
        context: SdkGeneratorContext;
        serviceId: ServiceId;
        sdkRequest: SdkRequest;
        wrapper: SdkRequestWrapper;
        service: HttpService;
        endpoint: HttpEndpoint;
    }
}

export class WrappedEndpointRequest extends EndpointRequest {
    private serviceId: ServiceId;
    private wrapper: SdkRequestWrapper;

    public constructor({ context, sdkRequest, serviceId, wrapper, service, endpoint }: WrappedEndpointRequest.Args) {
        super(context, sdkRequest, service, endpoint);
        this.serviceId = serviceId;
        this.wrapper = wrapper;
    }

    public getRequestParameterType(): go.Type {
        return go.Type.pointer(
            go.Type.reference(this.context.getRequestWrapperTypeReference(this.serviceId, this.wrapper.wrapperName))
        );
    }
}
