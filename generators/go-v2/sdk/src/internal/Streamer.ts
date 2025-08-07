import { assertNever } from "@fern-api/core-utils";
import { go } from "@fern-api/go-ast";

import { HttpEndpoint, SseStreamChunk, StreamingResponse } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace Streamer {
    export interface StreamArgs {
        endpoint: HttpEndpoint;
        streamerVariable: go.AstNode;
        optionsReference: go.AstNode;
        url: go.AstNode;
        streamingResponse: StreamingResponse;
        request?: go.AstNode;
        errorCodes?: go.AstNode;
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
        if (args.request != null) {
            arguments_.push({
                name: "Request",
                value: go.TypeInstantiation.reference(args.request)
            });
        }
        if (args.errorCodes != null) {
            arguments_.push({
                name: "ErrorDecoder",
                value: go.TypeInstantiation.reference(this.context.callNewErrorDecoder([args.errorCodes]))
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

    private getStreamPrefix(streamingResponse: StreamingResponse): go.TypeInstantiation | undefined {
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

    private getStreamTerminator(streamingResponse: StreamingResponse): go.TypeInstantiation | undefined {
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

    private getSSETerminatorTypeReference(sse: SseStreamChunk): go.TypeInstantiation {
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
}
