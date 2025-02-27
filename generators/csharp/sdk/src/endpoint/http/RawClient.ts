import { Arguments } from "@fern-api/base-generator";
import { csharp } from "@fern-api/csharp-codegen";

import { HttpEndpoint, HttpMethod } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { getContentTypeFromRequestBody } from "../utils/getContentTypeFromRequestBody";

export declare namespace RawClient {
    export type RequestBodyType = "json" | "bytes";

    export interface SendRequestArgs {
        /** The reference to the client */
        clientReference: string;
        /** The instance of the request wrapper */
        request: csharp.CodeBlock | csharp.ClassInstantiation;
    }
    export interface CreateHttpRequestWrapperArgs {
        baseUrl: csharp.CodeBlock;
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
        /** the request type, defaults to Json if none */
        requestType: RequestBodyType | undefined;
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
        requestType
    }: RawClient.CreateHttpRequestWrapperArgs): csharp.ClassInstantiation {
        const args: Arguments = [
            {
                name: "BaseUrl",
                assignment: baseUrl
            },
            {
                name: "Method",
                assignment: this.getCsharpHttpMethod(endpoint.method)
            },
            {
                name: "Path",
                assignment: csharp.codeblock(
                    (writer) =>
                        `${this.writePathString({
                            writer,
                            endpoint,
                            pathParameterReferences: pathParameterReferences ?? {}
                        })}`
                )
            }
        ];
        if (bodyReference != null) {
            args.push({
                name: "Body",
                assignment: csharp.codeblock(bodyReference)
            });
        }
        if (queryBagReference != null) {
            args.push({
                name: "Query",
                assignment: csharp.codeblock(queryBagReference)
            });
        }
        if (headerBagReference != null) {
            args.push({
                name: "Headers",
                assignment: csharp.codeblock(headerBagReference)
            });
        }
        const requestContentType = getContentTypeFromRequestBody(endpoint);
        if (requestContentType) {
            args.push({
                name: "ContentType",
                assignment: csharp.codeblock(`"${requestContentType}"`)
            });
        }
        if (endpoint.idempotent) {
            args.push({
                name: "Options",
                assignment: csharp.codeblock(this.context.getIdempotentRequestOptionsParameterName())
            });
        } else {
            args.push({
                name: "Options",
                assignment: csharp.codeblock(this.context.getRequestOptionsParameterName())
            });
        }
        if (requestType === "bytes") {
            return csharp.instantiateClass({
                arguments_: args,
                classReference: csharp.classReference({
                    name: "RawClient.StreamApiRequest",
                    namespace: this.context.getCoreNamespace()
                })
            });
        } else {
            return csharp.instantiateClass({
                arguments_: args,
                classReference: csharp.classReference({
                    name: "RawClient.JsonApiRequest",
                    namespace: this.context.getCoreNamespace()
                })
            });
        }
    }

    /**
     * Creates an HTTP request using the RawClient.
     */
    public createHttpRequest({ clientReference, request }: RawClient.SendRequestArgs): csharp.MethodInvocation {
        return csharp.invokeMethod({
            on: csharp.codeblock(clientReference),
            method: "CreateHttpRequest",
            arguments_: [request]
        });
    }

    /**
     * Sends an HTTP request to the RawClient.
     */
    public sendRequest({ clientReference, request }: RawClient.SendRequestArgs): csharp.MethodInvocation {
        return csharp.invokeMethod({
            on: csharp.codeblock(clientReference),
            method: "SendRequestAsync",
            arguments_: [request, csharp.codeblock(this.context.getCancellationTokenParameterName())],
            async: true
        });
    }

    private getCsharpHttpMethod(irMethod: HttpMethod): csharp.CodeBlock {
        let method: string;
        switch (irMethod) {
            case "POST":
                method = "Post";
                break;
            case "DELETE":
                method = "Delete";
                break;
            case "PATCH":
                return csharp.codeblock((writer) => {
                    writer.writeNode(csharp.coreClassReference({ name: "HttpMethodExtensions" }));
                    writer.write(".Patch");
                });
            case "GET":
                method = "Get";
                break;
            case "PUT":
                method = "Put";
                break;
        }
        return csharp.codeblock((writer) => {
            writer.writeNode(csharp.classReference({ name: "HttpMethod", namespace: "System.Net.Http" }));
            writer.write(`.${method}`);
        });
    }

    private writePathString({
        writer,
        endpoint,
        pathParameterReferences
    }: {
        writer: csharp.Writer;
        endpoint: HttpEndpoint;
        pathParameterReferences: Record<string, string>;
    }): void {
        const hasPathParameters = endpoint.fullPath.parts.some((part) => part.pathParameter != null);

        writer.write(hasPathParameters ? `$"${endpoint.fullPath.head}` : `"${endpoint.fullPath.head}`);
        for (const part of endpoint.fullPath.parts) {
            const reference = pathParameterReferences[part.pathParameter];
            if (reference == null) {
                throw new Error(
                    `Failed to find request parameter for the endpoint ${endpoint.id} with path parameter ${part.pathParameter}`
                );
            }
            writer.write("{");
            writer.writeNode(this.context.getJsonUtilsClassReference());
            writer.write(`.SerializeAsString(${reference})`);
            writer.write("}");
            writer.write(part.tail);
        }
        writer.write('"');
    }
}
