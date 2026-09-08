import { getWireValue } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
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

export class FileUploadEndpointRequest extends EndpointRequest {
    private fileUploadRequest: FernIr.FileUploadRequest;

    public constructor(
        context: SdkGeneratorContext,
        sdkRequest: FernIr.SdkRequest,
        endpoint: FernIr.HttpEndpoint,
        fileUploadRequest: FernIr.FileUploadRequest
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
            writer.newLine();
            for (const property of this.fileUploadRequest.properties) {
                if (property.type === "file") {
                    const snakeCaseName = this.case.snakeSafe(property.value.key);
                    writer.writeNode(
                        ruby.ifElse({
                            if: {
                                condition: ruby.codeblock((writer) => {
                                    writer.write(`params[:${snakeCaseName}]`);
                                }),
                                thenBody: [
                                    ruby.codeblock((writer) => {
                                        const wireName = getWireValue(property.value.key);
                                        switch (property.value.type) {
                                            case "file":
                                                writer.writeLine(
                                                    `body.add_file(name: "${wireName}", file: params[:${snakeCaseName}])`
                                                );
                                                break;
                                            case "fileArray":
                                                writer.writeLine(
                                                    `params[:${snakeCaseName}].each { |file| body.add_file(name: "${wireName}", file: file) }`
                                                );
                                                break;
                                            default:
                                                assertNever(property.value);
                                        }
                                    })
                                ]
                            }
                        })
                    );
                } else {
                    const snakeCaseName = this.case.snakeSafe(property.name);
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
                                                value: ruby.TypeLiteral.string(getWireValue(property.name))
                                            }),
                                            ruby.keywordArgument({
                                                name: "value",
                                                value:
                                                    this.getFormDataPartForNonFileProperty(property) ??
                                                    ruby.codeblock(`params[:${snakeCaseName}]`)
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

    private getFormDataPartForNonFileProperty(property: FernIr.FileUploadBodyProperty): ruby.CodeBlock | undefined {
        const snakeCaseName = this.case.snakeSafe(property.name);
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
