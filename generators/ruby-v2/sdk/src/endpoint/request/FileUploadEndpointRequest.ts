
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
                    writer.writeNode(ruby.ifElse({
                        if: {
                            condition: ruby.codeblock((writer) => {
                                writer.write(`params[${property.value.key.wireValue}]`);
                            }),
                            thenBody: [
                                ruby.codeblock((writer) => {
                                    writer.writeLine(`body.add(Internal::Multipart::FilePart.new(${property.value.key.wireValue}, File.new(params[${property.value.key.wireValue}]), "application/octet-stream"))`);
                                })
                            ]
                        }
                    }));
                } else {
                    writer.writeNode(ruby.ifElse({
                        if: {
                            condition: ruby.codeblock((writer) => {
                                writer.write(`params[${property.name.wireValue}]`);
                            }),
                            thenBody: [
                                ruby.codeblock((writer) => {
                                    writer.writeLine(`body.add_part(params[:${property.name.wireValue}].to_form_data_part(name: "${property.name.wireValue}"))`);
                                })
                            ]
                        }
                    }));
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