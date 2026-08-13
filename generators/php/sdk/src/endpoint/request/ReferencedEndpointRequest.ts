import { php } from "@fern-api/php-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { mayOmitRequestBody } from "../utils/mayOmitRequestBody.js";
import {
    EndpointRequest,
    HeaderParameterCodeBlock,
    QueryParameterCodeBlock,
    RequestBodyCodeBlock
} from "./EndpointRequest.js";

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

    public getRequestParameterType(): php.Type {
        const type = this.context.phpTypeMapper.convert({ reference: this.requestBodyShape });
        return this.mayBeOmitted() ? php.Type.optional(type) : type;
    }

    public override getRequestParameterInitializer(): php.CodeBlock | undefined {
        return this.mayBeOmitted() ? php.codeblock("null") : undefined;
    }

    private mayBeOmitted(): boolean {
        return mayOmitRequestBody({ context: this.context, endpoint: this.endpoint });
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
