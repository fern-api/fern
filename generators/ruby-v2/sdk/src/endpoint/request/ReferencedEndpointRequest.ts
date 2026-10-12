import { ruby } from "@fern-api/ruby-ast";
import { FernIr } from "@fern-fern/ir-sdk";
import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { isUrlEncodedRequestBody } from "../../utils/requestBody.js";
import { RawClient } from "../http/RawClient.js";
import {
    BODY_BAG_NAME,
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
        const omitContentTypeWithoutBody = this.respectsOptionalRequestBody();
        const modelTypeId = this.getModelBodyTypeId(this.requestBodyShape);
        if (modelTypeId == null) {
            return {
                omitContentTypeWithoutBody,
                requestBodyReference: ruby.codeblock((writer) => {
                    if (omitContentTypeWithoutBody) {
                        this.writeOptionalValueGuard(
                            writer,
                            this.getBodyArgumentReference(this.sdkRequest.requestParameterName)
                        );
                    }
                    writer.write(
                        this.getBodyValueExpression(this.requestBodyShape, this.sdkRequest.requestParameterName)
                    );
                })
            };
        }

        const hasPathParameters = this.hasPathParameters();
        const bodyParamsVar = hasPathParameters ? BODY_BAG_NAME : "params";
        return {
            omitContentTypeWithoutBody,
            code: hasPathParameters
                ? ruby.codeblock((writer) => {
                      this.writePathParameterExclusion(writer);
                  })
                : undefined,
            requestBodyReference: ruby.codeblock((writer) => {
                if (omitContentTypeWithoutBody) {
                    this.writeOptionalBodyGuard(writer, bodyParamsVar);
                }
                writer.write(`${this.context.getReferenceToTypeId(modelTypeId)}.new(${bodyParamsVar}).to_h`);
            })
        };
    }

    public getRequestType(): RawClient.RequestBodyType | undefined {
        return isUrlEncodedRequestBody(this.endpoint.requestBody) ? "urlencoded" : "json";
    }
}
