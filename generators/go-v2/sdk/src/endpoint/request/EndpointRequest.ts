import { go } from "@fern-api/go-ast";

import { HttpEndpoint, HttpService, SdkRequest } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";

export interface QueryParameterCodeBlock {
    code: go.CodeBlock;
    queryParameterBagReference: string;
}

export interface HeaderParameterCodeBlock {
    code: go.CodeBlock;
    headerParameterBagReference: string;
}

export interface RequestBodyCodeBlock {
    code?: go.CodeBlock;
    requestBodyReference: go.CodeBlock;
}

export abstract class EndpointRequest {
    public constructor(
        protected readonly context: SdkGeneratorContext,
        protected readonly sdkRequest: SdkRequest,
        protected readonly service: HttpService,
        protected readonly endpoint: HttpEndpoint
    ) {}

    public abstract getRequestParameterType(): go.Type;
    public abstract getRequestReference(): go.AstNode;
    public abstract getQueryParameterCodeBlock(): QueryParameterCodeBlock | undefined;
    public abstract getHeaderParameterCodeBlock(): HeaderParameterCodeBlock | undefined;
    public abstract getRequestBodyCodeBlock(): RequestBodyCodeBlock | undefined;

    public getRequestParameterName(): string {
        return this.context.getParameterName(this.sdkRequest.requestParameterName);
    }
}
