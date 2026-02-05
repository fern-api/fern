import { ruby } from "@fern-api/ruby-ast";
import { FileUploadBodyProperty, FileUploadRequest, HttpEndpoint, SdkRequest } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { RawClient } from "../http/RawClient";
import {
    EndpointRequest,
    HeaderParameterCodeBlock,
    QueryParameterCodeBlock,
    RequestBodyCodeBlock
} from "./EndpointRequest";

export class FileUploadEndpointRequest extends EndpointRequest {
    private fileUploadRequest: FileUploadRequest;

    public constructor(
        context: SdkGeneratorContext,
        sdkRequest: SdkRequest,
        endpoint: HttpEndpoint,
        fileUploadRequest: FileUploadRequest
    ) {
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
                    const snakeCaseName = property.value.key.name.snakeCase.safeName;
                    writer.writeNode(
                        ruby.ifElse({
                            if: {
                                condition: ruby.codeblock((writer) => {
                                    writer.write(`params[:${snakeCaseName}]`);
                                }),
                                thenBody: [
                                    ruby.codeblock((writer) => {
                                        writer.writeLine(
                                            `body.add_part(params[:${snakeCaseName}].to_form_data_part(name: "${property.value.key.wireValue}"))`
                                        );
                                    })
                                ]
                            }
                        })
                    );
                } else {
                    const snakeCaseName = property.name.name.snakeCase.safeName;
                    writer.writeNode(
                        ruby.ifElse({
                            if: {
                                condition: ruby.codeblock((writer) => {
                                    writer.write(`params[:${snakeCaseName}]`);
                                }),
                                thenBody: [
                                    ruby.codeblock((writer) => {
                                        const keywordArguments = [
                                            ruby.keywordArgument({
                                                name: "name",
                                                value: ruby.TypeLiteral.string(property.name.wireValue)
                                            }),
                                            ruby.keywordArgument({
                                                name: "value",
                                                value:
                                                    this.getFormDataPartForNonFileProperty(property) ??
                                                    ruby.codeblock("")
                                            })
                                        ];
                                        if (property.contentType) {
                                            keywordArguments.push(
                                                ruby.keywordArgument({
                                                    name: "content_type",
                                                    value: ruby.TypeLiteral.string(property.contentType)
                                                })
                                            );
                                        }
                                        writer.writeNode(
                                            ruby.invokeMethod({
                                                method: "add",
                                                on: ruby.codeblock("body"),
                                                arguments_: keywordArguments
                                            })
                                        );
                                    })
                                ]
                            }
                        })
                    );
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

    private getFormDataPartForNonFileProperty(property: FileUploadBodyProperty): ruby.CodeBlock | undefined {
        const snakeCaseName = property.name.name.snakeCase.safeName;
        switch (property.style) {
            case "json":
                return ruby.codeblock((writer) => {
                    writer.write("JSON.generate(");
                    if (property.valueType.type === "named") {
                        writer.writeNode(this.context.getClassReferenceForTypeId(property.valueType.typeId));
                        writer.write(".new(");
                        writer.write(`params[:${snakeCaseName}]`);
                        writer.write(")");
                        writer.write(".to_h");
                    } else {
                        writer.write(`params[:${snakeCaseName}]`);
                    }
                    writer.write(")");
                });
            case "form":
                return undefined;
        }
        return ruby.codeblock((writer) => {
            writer.write(`params[:${snakeCaseName}]`);
        });
    }

    public getRequestType(): RawClient.RequestBodyType | undefined {
        return "multipartform";
    }
}
