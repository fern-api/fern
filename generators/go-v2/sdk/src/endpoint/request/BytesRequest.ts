import { go } from "@fern-api/go-ast";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { EndpointRequest } from "./EndpointRequest.js";

export class BytesRequest extends EndpointRequest {
    // biome-ignore lint/complexity/noUselessConstructor: allow
    public constructor(
        context: SdkGeneratorContext,
        sdkRequest: FernIr.SdkRequest,
        service: FernIr.HttpService,
        endpoint: FernIr.HttpEndpoint
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
