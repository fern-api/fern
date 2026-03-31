import { ruby } from "@fern-api/ruby-ast";
import { FernIr } from "@fern-fern/ir-sdk";
import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { RawClient } from "../http/RawClient.js";

export interface QueryParameterCodeBlock {
    code: ruby.CodeBlock;
    queryParameterBagReference: string;
}

export interface HeaderParameterCodeBlock {
    code: ruby.CodeBlock;
    headerParameterBagReference: string;
}

export interface RequestBodyCodeBlock {
    code?: ruby.CodeBlock;
    requestBodyReference: ruby.CodeBlock;
}

export abstract class EndpointRequest {
    public constructor(
        protected readonly context: SdkGeneratorContext,
        protected readonly sdkRequest: FernIr.SdkRequest,
        protected readonly endpoint: FernIr.HttpEndpoint
    ) {}

    public getParameterName(): string {
        return this.sdkRequest.requestParameterName.camelCase.safeName;
    }

    public getRequestBodyVariableName(): string {
        return "requestBody";
    }

    public abstract getParameterType(): ruby.Type;

    public abstract getQueryParameterCodeBlock(queryParameterBagName: string): QueryParameterCodeBlock | undefined;

    public abstract getHeaderParameterCodeBlock(): HeaderParameterCodeBlock | undefined;

    public abstract getRequestBodyCodeBlock(): RequestBodyCodeBlock | undefined;

    public abstract getRequestType(): RawClient.RequestBodyType | undefined;
}
