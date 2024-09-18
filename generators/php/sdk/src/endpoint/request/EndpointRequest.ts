import { php } from "@fern-api/php-codegen";
import { HttpEndpoint, SdkRequest } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";

export interface QueryParameterCodeBlock {
    code: php.CodeBlock;
    queryParameterBagReference: string;
}

export interface HeaderParameterCodeBlock {
    code: php.CodeBlock;
    headerParameterBagReference: string;
}

export interface RequestBodyCodeBlock {
    code?: php.CodeBlock;
    requestBodyReference: string;
}

export abstract class EndpointRequest {
    public constructor(
        protected readonly context: SdkGeneratorContext,
        protected readonly sdkRequest: SdkRequest,
        protected readonly endpoint: HttpEndpoint
    ) {}

    public getRequestParameterName(): string {
        return this.context.getParameterName(this.sdkRequest.requestParameterName);
    }

    public abstract getRequestParameterType(): php.Type;

    public abstract getQueryParameterCodeBlock(): QueryParameterCodeBlock | undefined;

    public abstract getHeaderParameterCodeBlock(): HeaderParameterCodeBlock | undefined;

    public abstract getRequestBodyCodeBlock(): RequestBodyCodeBlock | undefined;
}
