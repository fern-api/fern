import { go } from "@fern-api/go-ast";

import { HttpEndpoint, HttpService, SdkRequest } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { EndpointRequest } from "./EndpointRequest.js";

export class BytesRequest extends EndpointRequest {
    // biome-ignore lint/complexity/noUselessConstructor: allow
    public constructor(
        context: SdkGeneratorContext,
        sdkRequest: SdkRequest,
        service: HttpService,
        endpoint: HttpEndpoint
    ) {
        super(context, sdkRequest, service, endpoint);
    }

    public getRequestParameterType(): go.Type {
        if (this.context.customConfig.useReaderForBytesRequest) {
            return go.Type.reference(this.context.getIoReaderTypeReference());
        }
        return go.Type.bytes();
    }

    public getRequestBodyBlock(): go.AstNode | undefined {
        return undefined;
    }
}
