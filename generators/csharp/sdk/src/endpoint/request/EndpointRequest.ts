import { csharp } from "@fern-api/csharp-codegen";
import { HttpEndpoint, SdkRequest, ServiceId } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { ReferencedEndpointRequest } from "./ReferencedEndpointRequest";
import { WrappedEndpointRequest } from "./WrappedEndpointRequest";

export interface QueryParameterCodeBlock {
    code: csharp.CodeBlock;
    queryParameterBagReference: string;
}

export interface HeaderParameterCodeBlock {
    code: csharp.CodeBlock;
    headerParameterBagReference: string;
}

export interface RequestBodyCodeBlock {
    code?: csharp.CodeBlock;
    requestBodyReference: string;
}

export abstract class EndpointRequest {
    public constructor(
        protected readonly context: SdkGeneratorContext,
        protected readonly sdkRequest: SdkRequest,
        protected readonly endpoint: HttpEndpoint
    ) {}

    public getParameterName(): string {
        return this.sdkRequest.requestParameterName.camelCase.safeName;
    }

    public abstract getParameterType(): csharp.Type;

    public abstract getQueryParameterCodeBlock(): QueryParameterCodeBlock | undefined;

    public abstract getHeaderParameterCodeBlock(): HeaderParameterCodeBlock | undefined;

    public abstract getRequestBodyCodeBlock(): RequestBodyCodeBlock | undefined;
}
