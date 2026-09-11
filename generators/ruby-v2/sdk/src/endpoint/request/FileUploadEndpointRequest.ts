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

function addFileInvocation({ property, file }: { property: FernIr.FileProperty; file: string }): ruby.MethodInvocation {
    const keywordArguments = [
        ruby.keywordArgument({
            name: "name",
            value: ruby.TypeLiteral.string(getWireValue(property.key))
        }),
        ruby.keywordArgument({ name: "file", value: ruby.codeblock(file) })
    ];
    if (property.contentType != null) {
        keywordArguments.push(
            ruby.keywordArgument({
                name: "content_type",
                value: ruby.TypeLiteral.string(property.contentType)
            })
        );
    }
    return ruby.invokeMethod({
        method: "add_file",
        on: ruby.codeblock("body"),
        arguments_: [],
        keywordArguments
    });
}

export function buildFileUploadStatement({
    property,
    paramName
}: {
    property: FernIr.FileProperty;
    paramName: string;
}): ruby.AstNode {
    const param = `params[:${paramName}]`;
    const condition = ruby.codeblock(param);
    switch (property.type) {
        case "file":
            return ruby.ifElse({
                if: { condition, thenBody: [addFileInvocation({ property, file: param })] }
            });
        case "fileArray":
            return ruby.invokeMethod({
                method: "each",
                on: condition,
                arguments_: [],
                safeNavigation: true,
                block: [["file"], [addFileInvocation({ property, file: "file" })]]
            });
        default:
            assertNever(property);
    }
}

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
                    writer.writeNodeStatement(
                        buildFileUploadStatement({
                            property: property.value,
                            paramName: this.case.snakeSafe(property.value.key)
                        })
                    );
                } else {
                    const snakeCaseName = this.case.snakeSafe(property.name);
                    writer.writeNode(
                        ruby.ifElse({
                            // Guard on `.nil?` rather than truthiness (which would drop a
                            // legitimate `false`/`0`) or `params.key?` (which would emit an
                            // empty part for an explicitly-passed `nil`, since multipart has
                            // no null representation and `nil.to_s` encodes as "").
                            negated: true,
                            if: {
                                condition: ruby.codeblock((writer) => {
                                    writer.write(`params[:${snakeCaseName}].nil?`);
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
