import { assertNever } from "@fern-api/core-utils";
import { go } from "@fern-api/go-ast";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

export declare namespace Streamer {
    export interface StreamArgs {
        endpoint: FernIr.HttpEndpoint;
        streamerVariable: go.AstNode;
        optionsReference: go.AstNode;
        url: go.AstNode;
        streamingResponse: FernIr.StreamingResponse;
        request?: go.AstNode;
        errorCodes?: go.AstNode;
        /** The import path of the namespace where the endpoint is defined. Used to reference namespace-specific ErrorCodes. */
        namespaceImportPath?: string;
    }
}

/**
 * Utility class that helps make HTTP streaming calls.
 */
export class Streamer {
    public static TYPE_NAME = "Streamer";
    public static CONSTRUCTOR_FUNC_NAME = "NewStreamer";
    public static STREAM_PARAMS_TYPE_NAME = "StreamParams";
    public static STREAM_METHOD_NAME = "Stream";
    public static STREAM_WITH_EVENT_UNMARSHAL_METHOD_NAME = "StreamWithEventUnmarshal";

    private context: SdkGeneratorContext;

    public constructor(context: SdkGeneratorContext) {
        this.context = context;
    }

    public getTypeReference(): go.TypeReference {
        return go.typeReference({
            name: Streamer.TYPE_NAME,
            importPath: this.context.getInternalImportPath()
        });
    }

    public getConstructorTypeReference({ streamPayload }: { streamPayload: go.Type }): go.TypeReference {
        return go.typeReference({
            name: Streamer.CONSTRUCTOR_FUNC_NAME,
            importPath: this.context.getInternalImportPath(),
            generics: [streamPayload]
        });
    }

    public getStreamParamsTypeReference(): go.TypeReference {
        return go.typeReference({
            name: Streamer.STREAM_PARAMS_TYPE_NAME,
            importPath: this.context.getInternalImportPath()
        });
    }

    public instantiate({
        callerReference,
        streamPayload
    }: {
        callerReference: go.AstNode;
        streamPayload: go.Type;
    }): go.AstNode {
        return go.invokeFunc({
            func: this.getConstructorTypeReference({ streamPayload }),
            arguments_: [callerReference]
        });
    }

    public stream(args: Streamer.StreamArgs): go.AstNode {
        const arguments_: go.StructField[] = [
            {
                name: "URL",
                value: go.TypeInstantiation.reference(args.url)
            },
            {
                name: "Method",
                value: go.TypeInstantiation.reference(this.context.getNetHttpMethodTypeReference(args.endpoint.method))
            },
            {
                name: "Headers",
                value: go.TypeInstantiation.reference(go.codeblock("headers"))
            },
            {
                name: "MaxAttempts",
                value: go.TypeInstantiation.reference(
                    go.selector({
                        on: args.optionsReference,
                        selector: go.codeblock("MaxAttempts")
                    })
                )
            },
            {
                name: "BodyProperties",
                value: go.TypeInstantiation.reference(
                    go.selector({
                        on: args.optionsReference,
                        selector: go.codeblock("BodyProperties")
                    })
                )
            },
            {
                name: "QueryParameters",
                value: go.TypeInstantiation.reference(
                    go.selector({
                        on: args.optionsReference,
                        selector: go.codeblock("QueryParameters")
                    })
                )
            },
            {
                name: "Client",
                value: go.TypeInstantiation.reference(
                    go.selector({
                        on: args.optionsReference,
                        selector: go.codeblock("HTTPClient")
                    })
                )
            },
            {
                name: "MaxBufSize",
                value: go.TypeInstantiation.reference(
                    go.selector({
                        on: args.optionsReference,
                        selector: go.codeblock("MaxBufSize")
                    })
                )
            }
        ];
        const prefix = this.getStreamPrefix(args.streamingResponse);
        if (prefix != null) {
            arguments_.push({
                name: "Prefix",
                value: prefix
            });
        }
        const terminator = this.getStreamTerminator(args.streamingResponse);
        if (terminator != null) {
            arguments_.push({
                name: "Terminator",
                value: terminator
            });
        }
        const format = this.getStreamFormat(args.streamingResponse);
        if (format != null) {
            arguments_.push({
                name: "Format",
                value: format
            });
        }
        const eventDiscriminator = this.getEventDiscriminator(args.streamingResponse);
        if (eventDiscriminator != null) {
            arguments_.push({
                name: "EventDiscriminator",
                value: eventDiscriminator
            });
        }
        if (args.request != null) {
            arguments_.push({
                name: "Request",
                value: go.TypeInstantiation.reference(args.request)
            });
        }
        // In per-endpoint mode, use the locally generated error codes variable.
        // In global mode, use the ErrorCodes variable from the namespace where the endpoint is defined.
        const errorCodesReference =
            this.context.isPerEndpointErrorCodes() && args.errorCodes != null
                ? args.errorCodes
                : go.TypeInstantiation.reference(this.context.getErrorCodesVariableReference(args.namespaceImportPath));
        arguments_.push({
            name: "ErrorDecoder",
            value: go.TypeInstantiation.reference(this.context.callNewErrorDecoder([errorCodesReference]))
        });
        const protocolUnionInfo = this.getProtocolDiscriminatedUnionInfo(args.streamingResponse);
        if (protocolUnionInfo != null) {
            // For protocol-discriminated unions, use StreamWithEventUnmarshal
            // which receives the SSE event type and raw data, and returns the
            // deserialized union type.
            return go.codeblock((writer) => {
                writer.writeNode(
                    go.invokeMethod({
                        on: args.streamerVariable,
                        method: Streamer.STREAM_WITH_EVENT_UNMARSHAL_METHOD_NAME,
                        arguments_: [
                            this.context.getContextParameterReference(),
                            go.TypeInstantiation.structPointer({
                                typeReference: this.getStreamParamsTypeReference(),
                                fields: arguments_
                            }),
                            this.generateEventUnmarshalFunc(protocolUnionInfo)
                        ]
                    })
                );
            });
        }
        return go.codeblock((writer) => {
            writer.writeNode(
                go.invokeMethod({
                    on: args.streamerVariable,
                    method: Streamer.STREAM_METHOD_NAME,
                    arguments_: [
                        this.context.getContextParameterReference(),
                        go.TypeInstantiation.structPointer({
                            typeReference: this.getStreamParamsTypeReference(),
                            fields: arguments_
                        })
                    ]
                })
            );
        });
    }

    private getStreamPrefix(streamingResponse: FernIr.StreamingResponse): go.TypeInstantiation | undefined {
        switch (streamingResponse.type) {
            case "sse":
                return go.TypeInstantiation.reference(this.getDefaultSSEDataPrefixTypeReference());
            case "json":
            case "text":
                return undefined;
            default:
                assertNever(streamingResponse);
        }
    }

    private getStreamTerminator(streamingResponse: FernIr.StreamingResponse): go.TypeInstantiation | undefined {
        switch (streamingResponse.type) {
            case "json":
                return streamingResponse.terminator != null
                    ? go.TypeInstantiation.string(streamingResponse.terminator)
                    : undefined;
            case "sse":
                return this.getSSETerminatorTypeReference(streamingResponse);
            case "text":
                return undefined;
            default:
                assertNever(streamingResponse);
        }
    }

    private getStreamFormat(streamingResponse: FernIr.StreamingResponse): go.TypeInstantiation | undefined {
        switch (streamingResponse.type) {
            case "sse":
                return go.TypeInstantiation.reference(this.getStreamFormatSseTypeReference());
            case "json":
            case "text":
                return undefined;
            default:
                assertNever(streamingResponse);
        }
    }

    private getSSETerminatorTypeReference(sse: FernIr.SseStreamChunk): go.TypeInstantiation {
        if (sse.terminator != null) {
            return go.TypeInstantiation.string(sse.terminator);
        }
        return go.TypeInstantiation.reference(this.getDefaultSSEStreamTerminatorTypeReference());
    }

    private getDefaultSSEStreamTerminatorTypeReference(): go.TypeReference {
        return go.typeReference({
            name: "DefaultSSETerminator",
            importPath: this.context.getInternalImportPath()
        });
    }

    private getDefaultSSEDataPrefixTypeReference(): go.TypeReference {
        return go.typeReference({
            name: "DefaultSSEDataPrefix",
            importPath: this.context.getInternalImportPath()
        });
    }

    private getStreamFormatSseTypeReference(): go.TypeReference {
        return go.typeReference({
            name: "StreamFormatSSE",
            importPath: this.context.getCoreImportPath()
        });
    }

    private getEventDiscriminator(streamingResponse: FernIr.StreamingResponse): go.TypeInstantiation | undefined {
        if (streamingResponse.type !== "sse") {
            return undefined;
        }
        const payload = streamingResponse.payload;
        if (payload.type !== "named") {
            return undefined;
        }
        const typeDeclaration = this.context.getTypeDeclarationOrThrow(payload.typeId);
        if (typeDeclaration.shape.type !== "union") {
            return undefined;
        }
        const union = typeDeclaration.shape;
        if (
            !("discriminatorContext" in union) ||
            (union as { discriminatorContext?: string }).discriminatorContext !== "protocol"
        ) {
            return undefined;
        }
        // For protocol-discriminated unions, we still set EventDiscriminator for the stream format,
        // but discrimination is handled by the event unmarshal function.
        return go.TypeInstantiation.string(union.discriminant.wireValue);
    }

    private getProtocolDiscriminatedUnionInfo(streamingResponse: FernIr.StreamingResponse):
        | {
              unionTypeName: string;
              unionTypeImportPath: string;
              discriminantFieldName: string;
              variants: Array<{
                  wireValue: string;
                  fieldName: string;
                  variantType: FernIr.SingleUnionTypeProperties;
                  typeId?: FernIr.TypeId;
              }>;
          }
        | undefined {
        if (streamingResponse.type !== "sse") {
            return undefined;
        }
        const payload = streamingResponse.payload;
        if (payload.type !== "named") {
            return undefined;
        }
        const typeDeclaration = this.context.getTypeDeclarationOrThrow(payload.typeId);
        if (typeDeclaration.shape.type !== "union") {
            return undefined;
        }
        const union = typeDeclaration.shape;
        if (
            !("discriminatorContext" in union) ||
            (union as { discriminatorContext?: string }).discriminatorContext !== "protocol"
        ) {
            return undefined;
        }
        const location = this.context.getLocationForTypeId(payload.typeId);
        return {
            unionTypeName: this.context.getClassName(typeDeclaration.name.name),
            unionTypeImportPath: location.importPath,
            discriminantFieldName: this.context.getFieldName(union.discriminant.name),
            variants: union.types.map((singleUnionType) => ({
                wireValue: singleUnionType.discriminantValue.wireValue,
                fieldName: this.context.getFieldName(singleUnionType.discriminantValue.name),
                variantType: singleUnionType.shape,
                typeId:
                    singleUnionType.shape.propertiesType === "samePropertiesAsObject"
                        ? singleUnionType.shape.typeId
                        : undefined
            }))
        };
    }

    private generateEventUnmarshalFunc(
        unionInfo: NonNullable<ReturnType<Streamer["getProtocolDiscriminatedUnionInfo"]>>
    ): go.AstNode {
        return go.codeblock((writer) => {
            writer.writeNode(
                go.typeReference({
                    name: "EventUnmarshalFunc",
                    importPath: this.context.getCoreImportPath()
                })
            );
            // The type reference for the union pointer type
            const unionRef = go.typeReference({
                name: unionInfo.unionTypeName,
                importPath: unionInfo.unionTypeImportPath
            });
            writer.write(`[*`);
            writer.writeNode(unionRef);
            writer.write(`](func(eventType string, data []byte) (*`);
            writer.writeNode(unionRef);
            writer.writeLine(`, error) {`);
            writer.indent();
            writer.writeLine(`switch eventType {`);
            for (const variant of unionInfo.variants) {
                writer.writeLine(`case "${variant.wireValue}":`);
                writer.indent();
                if (variant.variantType.propertiesType === "samePropertiesAsObject" && variant.typeId != null) {
                    const variantTypeDecl = this.context.getTypeDeclarationOrThrow(variant.typeId);
                    const variantTypeRef = go.typeReference({
                        name: this.context.getClassName(variantTypeDecl.name.name),
                        importPath: this.context.getLocationForTypeId(variant.typeId).importPath
                    });
                    writer.write(`var value *`);
                    writer.writeNode(variantTypeRef);
                    writer.writeLine(``);
                    writer.write(`if err := `);
                    writer.writeNode(go.typeReference({ name: "Unmarshal", importPath: "encoding/json" }));
                    writer.writeLine(`(data, &value); err != nil {`);
                    writer.indent();
                    writer.writeLine(`return nil, err`);
                    writer.dedent();
                    writer.writeLine(`}`);
                    writer.write(`return &`);
                    writer.writeNode(unionRef);
                    writer.writeLine(
                        `{${unionInfo.discriminantFieldName}: "${variant.wireValue}", ${variant.fieldName}: value}, nil`
                    );
                } else if (variant.variantType.propertiesType === "noProperties") {
                    writer.write(`return &`);
                    writer.writeNode(unionRef);
                    writer.writeLine(`{${unionInfo.discriminantFieldName}: "${variant.wireValue}"}, nil`);
                } else if (variant.variantType.propertiesType === "singleProperty") {
                    writer.writeLine(`var value ${variant.fieldName}`);
                    writer.write(`if err := `);
                    writer.writeNode(go.typeReference({ name: "Unmarshal", importPath: "encoding/json" }));
                    writer.writeLine(`(data, &value); err != nil {`);
                    writer.indent();
                    writer.writeLine(`return nil, err`);
                    writer.dedent();
                    writer.writeLine(`}`);
                    writer.write(`return &`);
                    writer.writeNode(unionRef);
                    writer.writeLine(
                        `{${unionInfo.discriminantFieldName}: "${variant.wireValue}", ${variant.fieldName}: value}, nil`
                    );
                }
                writer.dedent();
            }
            writer.writeLine(`default:`);
            writer.indent();
            writer.write(`return nil, `);
            writer.writeNode(
                go.typeReference({ name: "Errorf", importPath: "fmt" })
            );
            writer.writeLine(`("unknown SSE event type: %s", eventType)`);
            writer.dedent();
            writer.writeLine(`}`);
            writer.dedent();
            writer.writeLine(`})`);
        });
    }
}
