import { go } from "@fern-api/go-ast";

import { HttpEndpoint, HttpService, SdkRequest } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";

export abstract class EndpointRequest {
    public constructor(
        protected readonly context: SdkGeneratorContext,
        protected readonly sdkRequest: SdkRequest,
        protected readonly service: HttpService,
        protected readonly endpoint: HttpEndpoint
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
