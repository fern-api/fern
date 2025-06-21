import { go } from "@fern-api/go-ast";

import { HttpEndpoint, HttpService, SdkRequest, TypeReference } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import {
    EndpointRequest,
    HeaderParameterCodeBlock,
    QueryParameterCodeBlock,
    RequestBodyCodeBlock
} from "./EndpointRequest";

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

    public getRequestReference(): go.AstNode {
        return go.codeblock("requestBuffer");
    }

    public getQueryParameterCodeBlock(): QueryParameterCodeBlock | undefined {
        return undefined;
    }

    public getHeaderParameterCodeBlock(): HeaderParameterCodeBlock | undefined {
        return undefined;
    }

    public getRequestBodyCodeBlock(): RequestBodyCodeBlock | undefined {
        return {
            requestBodyReference: go.codeblock(this.getRequestParameterName())
        };
    }
}
