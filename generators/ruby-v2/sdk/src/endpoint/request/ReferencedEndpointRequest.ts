import { ruby } from "@fern-api/ruby-ast";
import { FernIr } from "@fern-fern/ir-sdk";
import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { RawClient } from "../http/RawClient.js";
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
        endpoint: FernIr.HttpEndpoint,
        requestBodyShape: FernIr.TypeReference
    ) {
        super(context, sdkRequest, endpoint);
        this.requestBodyShape = requestBodyShape;
    }

    public getParameterType(): ruby.Type {
        if (this.requestBodyShape.type === "named") {
            const classRef = this.context.getReferenceToTypeId(this.requestBodyShape.typeId);
            return ruby.Type.class_({ name: classRef.name, modules: classRef.modules });
        }
        return ruby.Type.hash(ruby.Type.untyped(), ruby.Type.untyped());
    }

    public getQueryParameterCodeBlock(): QueryParameterCodeBlock | undefined {
        return undefined;
    }

    public getHeaderParameterCodeBlock(): HeaderParameterCodeBlock | undefined {
        return undefined;
    }

    public getRequestBodyCodeBlock(): RequestBodyCodeBlock | undefined {
        return {
            requestBodyReference: ruby.codeblock((writer) => {
                if (this.requestBodyShape.type === "named") {
                    const typeDeclaration = this.context.getTypeDeclarationOrThrow(this.requestBodyShape.typeId);
                    // Enums and aliases are modules, not classes, so they don't have a .new() method
                    if (typeDeclaration.shape.type === "enum" || typeDeclaration.shape.type === "alias") {
                        writer.write(`params`);
                    } else {
                        writer.write(
                            `${this.context.getReferenceToTypeId(this.requestBodyShape.typeId)}.new(params).to_h`
                        );
                    }
                } else {
                    writer.write(`params`);
                }
            })
        };
    }

    public getRequestType(): RawClient.RequestBodyType | undefined {
        return "json";
    }
}
