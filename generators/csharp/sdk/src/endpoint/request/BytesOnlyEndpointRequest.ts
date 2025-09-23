import { ast } from "@fern-api/csharp-codegen";
import { HttpEndpoint, SdkRequest } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { RawClient } from "../http/RawClient";
import {
    EndpointRequest,
    HeaderParameterCodeBlock,
    QueryParameterCodeBlock,
    RequestBodyCodeBlock
} from "./EndpointRequest";

export class BytesOnlyEndpointRequest extends EndpointRequest {
    // biome-ignore lint/complexity/noUselessConstructor: allow
    public constructor(context: SdkGeneratorContext, sdkRequest: SdkRequest, endpoint: HttpEndpoint) {
        super(context, sdkRequest, endpoint);
    }

    private get csharp() {
        return this.context.csharp;
    }

    public getParameterType(): ast.Type {
        return this.csharp.Type.coreClass(
            this.csharp.coreClassReference({
                name: "Stream"
            })
        );
    }

    public getQueryParameterCodeBlock(): QueryParameterCodeBlock | undefined {
        return undefined;
    }

    public getHeaderParameterCodeBlock(): HeaderParameterCodeBlock | undefined {
        return undefined;
    }

    public getRequestBodyCodeBlock(): RequestBodyCodeBlock | undefined {
        return {
            requestBodyReference: this.getParameterName()
        };
    }

    public getRequestType(): RawClient.RequestBodyType | undefined {
        return "bytes";
    }
}
