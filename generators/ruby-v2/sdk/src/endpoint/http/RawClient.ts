import { Arguments } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { ruby } from "@fern-api/ruby-ast";

import { FernIr } from "@fern-fern/ir-sdk";
import { HttpEndpoint, HttpMethod } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { EndpointRequest } from "../request/EndpointRequest";
import { getContentTypeFromRequestBody } from "../utils/getContentTypeFromRequestBody";

export declare namespace RawClient {
    export type RequestBodyType = "json" | "bytes" | "multipartform";

    export interface CreateHttpRequestArgs {
        /** The reference to the client */
        clientReference: string;
        /** The instance of the request wrapper */
        request: ruby.AstNode;
    }

    export interface SendRequestArgsWithRequestWrapper {
        /** The reference to the client */
        clientReference: string;
        /** The instance of the request wrapper */
        request: ruby.AstNode;
    }

    export interface SendRequestWithHttpRequestArgs {
        /** The reference to the client */
        clientReference: string;
        /** Request options */
        options: ruby.CodeBlock;
        /** The instance of the request wrapper */
        request: ruby.CodeBlock | ruby.ClassInstantiation;
        /** Cancellation token */
        cancellationToken: ruby.CodeBlock;
    }

    export interface CreateHttpRequestWrapperArgs {
        baseUrl: ruby.CodeBlock;
        /** the endpoint for the endpoint */
        endpoint: HttpEndpoint;
        /** reference to a variable that is the body */
        bodyReference?: string;
        /** the path parameter id to reference */
        pathParameterReferences?: Record<string, string>;
        /** the headers to pass to the endpoint */
        headerBagReference?: string;
        /** the query parameters to pass to the endpoint */
        queryBagReference?: string;
        endpointRequest?: EndpointRequest;
        /** the request type, defaults to Json if none */
        requestType: RequestBodyType | undefined;
    }

    export interface CreateHttpRequestWrapperCodeBlock {
        code?: ruby.CodeBlock;
        requestReference: ruby.AstNode;
    }
}

/**
 * Utility class that helps make calls to the raw client.
 */
export class RawClient {
    private context: SdkGeneratorContext;

    public constructor(context: SdkGeneratorContext) {
        this.context = context;
    }

    /**
     * Create an HTTP request wrapper.
     */
    public createHttpRequestWrapper({
        baseUrl,
        endpoint,
        bodyReference,
        pathParameterReferences,
        headerBagReference,
        queryBagReference,
        endpointRequest,
        requestType
    }: RawClient.CreateHttpRequestWrapperArgs): RawClient.CreateHttpRequestWrapperCodeBlock {
        const args: ruby.KeywordArgument[] = [
            ruby.keywordArgument({
                name: "BaseUrl",
                value: baseUrl
            }),
            ruby.keywordArgument({
                name: "Method",
                value: this.getRubyHttpMethod(endpoint.method)
            }),
            ruby.keywordArgument({
                name: "Path",
                value: ruby.codeblock(
                    (writer) =>
                        `${this.writePathString({
                            writer,
                            endpoint,
                            pathParameterReferences: pathParameterReferences ?? {}
                        })}`
                )
            })
        ];
        if (bodyReference != null) {
            args.push(
                ruby.keywordArgument({
                    name: "Body",
                    value: ruby.codeblock(bodyReference)
                })
            );
        }
        if (queryBagReference != null) {
            args.push(
                ruby.keywordArgument({
                    name: "Query",
                    value: ruby.codeblock(queryBagReference)
                })
            );
        }
        if (headerBagReference != null) {
            args.push(
                ruby.keywordArgument({
                    name: "Headers",
                    value: ruby.codeblock(headerBagReference)
                })
            );
        }
        const requestContentType = getContentTypeFromRequestBody(endpoint);
        if (requestContentType) {
            args.push(
                ruby.keywordArgument({
                    name: "ContentType",
                    value: ruby.codeblock(`"${requestContentType}"`)
                })
            );
        }
        if (endpoint.idempotent) {
            args.push(
                ruby.keywordArgument({
                    name: "Options",
                    value: ruby.codeblock(this.context.getIdempotentRequestOptionsParameterName())
                })
            );
        } else {
            args.push(
                ruby.keywordArgument({
                    name: "Options",
                    value: ruby.codeblock(this.context.getRequestOptionsParameterName())
                })
            );
        }
        switch (requestType) {
            case "bytes":
                throw new Error("Bytes requests are not supported");
            case "multipartform":
                throw new Error("Multipart form requests are not supported");
            case "json":
            default:
                return {
                    requestReference: ruby.instantiateClass({
                        arguments_: args,
                        classReference: ruby.classReference({
                            name: "JsonRequest",
                            modules: [this.context.getRootModule().name]
                        })
                    })
                };
        }
    }

    /**
     * Creates an HTTP request using the RawClient.
     */
    public createHttpRequest({ clientReference, request }: RawClient.CreateHttpRequestArgs): ruby.MethodInvocation {
        return ruby.invokeMethod({
            on: ruby.codeblock(clientReference),
            method: "CreateHttpRequest",
            arguments_: [request]
        });
    }

    /**
     * Sends an HTTP request to the RawClient.
     */
    public sendRequestWithRequestWrapper({
        clientReference,
        request
    }: RawClient.SendRequestArgsWithRequestWrapper): ruby.MethodInvocation {
        return ruby.invokeMethod({
            on: ruby.codeblock(clientReference),
            method: "SendRequestAsync",
            arguments_: [request, ruby.codeblock(this.context.getCancellationTokenParameterName())]
        });
    }

    /**
     * Sends an HTTP request to the RawClient.
     */
    public sendRequestWithHttpRequest({
        clientReference,
        options,
        request,
        cancellationToken
    }: RawClient.SendRequestWithHttpRequestArgs): ruby.MethodInvocation {
        return ruby.invokeMethod({
            on: ruby.codeblock(clientReference),
            method: "SendRequestAsync",
            arguments_: [request, options, ruby.codeblock(this.context.getCancellationTokenParameterName())]
        });
    }

    private getRubyHttpMethod(irMethod: HttpMethod): ruby.AstNode {
        let method: string;
        switch (irMethod) {
            case "POST":
                method = "Post";
                break;
            case "DELETE":
                method = "Delete";
                break;
            case "PATCH":
                throw new Error("Patch is not supported");
            case "GET":
                method = "Get";
                break;
            case "PUT":
                method = "Put";
                break;
            case "HEAD":
                method = "Head";
                break;
            default:
                assertNever(irMethod);
        }
        return ruby.codeblock((writer) => {
            writer.writeNode(ruby.classReference({ name: "HttpMethod", modules: [this.context.getRootModule().name] }));
            writer.write(`.${method}`);
        });
    }

    private writePathString({
        writer,
        endpoint,
        pathParameterReferences
    }: {
        writer: ruby.Writer;
        endpoint: HttpEndpoint;
        pathParameterReferences: Record<string, string>;
    }): void {
        const hasPathParameters = endpoint.fullPath.parts.some((part) => part.pathParameter != null);
        if (!hasPathParameters) {
            writer.write(`"${endpoint.fullPath.head}"`);
            return;
        }
        writer.write(`string.Format("${endpoint.fullPath.head}`);
        const formatParams: ruby.AstNode[] = [];
        let counter = 0;
        for (const part of endpoint.fullPath.parts) {
            writer.write(`{${counter++}}`);
            const reference = pathParameterReferences[part.pathParameter];
            if (reference == null) {
                throw new Error(
                    `Failed to find request parameter for the endpoint ${endpoint.id} with path parameter ${part.pathParameter}`
                );
            }
            formatParams.push(
                ruby.codeblock((writer) => {
                    writer.write(`${reference}`);
                })
            );
            writer.write(part.tail);
        }
        writer.write('"');
        if (formatParams.length > 0) {
            writer.write(", ");
            for (let i = 0; i < formatParams.length; i++) {
                writer.writeNode(formatParams[i] as ruby.AstNode);
                if (i < formatParams.length - 1) {
                    writer.write(", ");
                }
            }
        }
        writer.write(")");
    }
}
