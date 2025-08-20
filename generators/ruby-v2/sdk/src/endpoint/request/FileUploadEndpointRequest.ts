
import { ruby } from "@fern-api/ruby-ast";
import { FileUploadRequest, HttpEndpoint, SdkRequest } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { RAW_CLIENT_REQUEST_VARIABLE_NAME, RawClient } from "../http/RawClient";
import { EndpointRequest, HeaderParameterCodeBlock, QueryParameterCodeBlock, RequestBodyCodeBlock } from "./EndpointRequest";


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
            writer.writeLine("body = Internal::Multipart::FormData.new");
            writer.writeLine();
            for (const property of this.fileUploadRequest.properties) {
                if (property.type === "file") {
                    // File property handling
                    writer.writeLine(`if params[:${property.value.key.wireValue}]`);
                    writer.indent();
                    writer.writeLine(`body.add(Internal::Multipart::FilePart.new(:${property.value.key.wireValue}, File.new(params[:${property.value.key.wireValue}]), "application/octet-stream"))`);
                    writer.dedent();
                    writer.writeLine("end");
                } else {
                    // Body property handling
                    writer.writeLine(`if params[:${property.name.wireValue}]`);
                    writer.indent();
                    writer.writeLine(`body.add_part(params[:${property.name.wireValue}].to_form_data_part(name: "${property.name.wireValue}"))`);
                    writer.dedent();
                    writer.writeLine("end");
                }
            }
        });
        return {
            code: codeBlock,
            requestBodyReference: ruby.codeblock((writer) => {
                writer.write(`body`);
            })
        };
    }
    
    public getRequestType(): RawClient.RequestBodyType | undefined {
        return "multipartform";
    }
}