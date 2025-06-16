import { go } from "@fern-api/go-ast";

import {
    HttpEndpoint,
    HttpService,
    Name,
    SdkRequest,
    SdkRequestWrapper,
    ServiceId,
    TypeReference
} from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import {
    EndpointRequest,
    HeaderParameterCodeBlock,
    QueryParameterCodeBlock,
    RequestBodyCodeBlock
} from "./EndpointRequest";

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
    private requestParameterName: Name;

    public constructor({ context, sdkRequest, serviceId, wrapper, service, endpoint }: WrappedEndpointRequest.Args) {
        super(context, sdkRequest, service, endpoint);
        this.serviceId = serviceId;
        this.wrapper = wrapper;
        this.requestParameterName = sdkRequest.requestParameterName;
    }

    public getRequestParameterType(): go.Type {
        return go.Type.pointer(
            go.Type.reference(this.context.getRequestWrapperTypeReference(this.serviceId, this.wrapper.wrapperName))
        );
    }

    public getQueryParameterCodeBlock(): QueryParameterCodeBlock | undefined {
        // TODO: Implement this.
        return undefined;
    }

    public getHeaderParameterCodeBlock(): HeaderParameterCodeBlock | undefined {
        // TODO: Implement this.
        return undefined;
    }

    public getRequestBodyCodeBlock(): RequestBodyCodeBlock | undefined {
        return {
            requestBodyReference: go.codeblock(this.getRequestParameterName())
        };
    }
}
