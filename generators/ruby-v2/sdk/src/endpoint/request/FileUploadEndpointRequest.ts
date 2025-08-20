
import { ruby } from "@fern-api/ruby-ast";
import { RAW_CLIENT_REQUEST_VARIABLE_NAME, RawClient } from "../http/RawClient";
import { EndpointRequest, HeaderParameterCodeBlock, QueryParameterCodeBlock, RequestBodyCodeBlock } from "./EndpointRequest";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { FileUploadRequest, HttpEndpoint, SdkRequest } from "@fern-fern/ir-sdk/api";


export class FileUploadEndpointRequest extends EndpointRequest {
    private fileUploadRequest: FileUploadRequest;

    public constructor(context: SdkGeneratorContext, sdkRequest: SdkRequest, endpoint: HttpEndpoint, fileUploadRequest: FileUploadRequest) {
        super(context, sdkRequest, endpoint);
        this.fileUploadRequest = fileUploadRequest;
    }
    
    public getParameterType(): ruby.Type {
        return ruby.Type.void();
    }
    
    public getQueryParameterCodeBlock(): QueryParameterCodeBlock | undefined {
        return undefined;
    }
    
    public getHeaderParameterCodeBlock(): HeaderParameterCodeBlock | undefined {
        return undefined;
    }
    
    public getRequestBodyCodeBlock(): RequestBodyCodeBlock | undefined {
        const codeBlock = ruby.codeblock((writer) => {
            for (const property of this.fileUploadRequest.properties) {
                if (property.type === "file") {
                    writer.writeLine(`hi this is a file, ${property.value.key.wireValue}`);
                } else {
                    writer.writeLine(`hi this is not a file, ${property.name.wireValue}`);
                }
            }
        });
        return {
            code: codeBlock,
            requestBodyReference: ruby.codeblock((writer) => {
                writer.writeLine(`${RAW_CLIENT_REQUEST_VARIABLE_NAME}.to_json`);
            })
        };
    }
    
    public getRequestType(): RawClient.RequestBodyType | undefined {
        return "multipartform";
    }
}