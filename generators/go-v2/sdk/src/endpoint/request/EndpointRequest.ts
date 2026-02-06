import { go } from "@fern-api/go-ast";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";

export abstract class EndpointRequest {
    public constructor(
        protected readonly context: SdkGeneratorContext,
        protected readonly sdkRequest: FernIr.SdkRequest,
        protected readonly service: FernIr.HttpService,
        protected readonly endpoint: FernIr.HttpEndpoint
    ) {}

    public abstract getRequestParameterType(): go.Type;
    public abstract getRequestBodyBlock(): go.AstNode | undefined;

    public getRequestReference(): go.AstNode | undefined {
        return go.codeblock(this.getRequestParameterName());
    }

    public getRequestParameterName(): string {
        return this.context.getParameterName(this.sdkRequest.requestParameterName);
    }
}
