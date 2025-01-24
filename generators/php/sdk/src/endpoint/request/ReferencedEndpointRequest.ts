import { php } from "@fern-api/php-codegen";

import { HttpEndpoint, SdkRequest, TypeReference } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import {
    EndpointRequest,
    HeaderParameterCodeBlock,
    QueryParameterCodeBlock,
    RequestBodyCodeBlock
} from "./EndpointRequest";

export class ReferencedEndpointRequest extends EndpointRequest {
    private requestBodyShape: TypeReference;

    public constructor(
        context: SdkGeneratorContext,
        sdkRequest: SdkRequest,
        endpoint: HttpEndpoint,
        requestBodyShape: TypeReference
    ) {
        super(context, sdkRequest, endpoint);
        this.requestBodyShape = requestBodyShape;
    }

    public getRequestParameterType(): php.Type {
        return this.context.phpTypeMapper.convert({ reference: this.requestBodyShape });
    }

    public getQueryParameterCodeBlock(): QueryParameterCodeBlock | undefined {
        return undefined;
    }

    public getHeaderParameterCodeBlock(): HeaderParameterCodeBlock | undefined {
        return undefined;
    }

    public getRequestBodyCodeBlock(): RequestBodyCodeBlock | undefined {
        return {
            requestBodyReference: this.serializeJsonRequest({
                bodyArgument: php.codeblock(this.getRequestParameterName())
            })
        };
    }
}
