import { go } from "@fern-api/go-ast";

import { HttpEndpoint, HttpService, SdkRequest } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { EndpointRequest } from "./EndpointRequest";

export class BytesRequest extends EndpointRequest {
    public constructor(
        context: SdkGeneratorContext,
        sdkRequest: SdkRequest,
        service: HttpService,
        endpoint: HttpEndpoint
    ) {
        super(context, sdkRequest, service, endpoint);
    }

    public getRequestParameterType(): go.Type {
        return go.Type.bytes();
    }
}
