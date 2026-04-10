import { go } from "@fern-api/go-ast";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { EndpointRequest } from "./EndpointRequest.js";

export class ReferencedEndpointRequest extends EndpointRequest {
    private requestBodyShape: FernIr.TypeReference;

    public constructor(
        context: SdkGeneratorContext,
        sdkRequest: FernIr.SdkRequest,
        service: FernIr.HttpService,
        endpoint: FernIr.HttpEndpoint,
        requestBodyShape: FernIr.TypeReference
    ) {
        super(context, sdkRequest, service, endpoint);
        this.requestBodyShape = requestBodyShape;
    }

    public getRequestParameterType(): go.Type {
        return this.context.goTypeMapper.convert({ reference: this.requestBodyShape });
    }

    public getRequestBodyBlock(): go.AstNode | undefined {
        return undefined;
    }
}
