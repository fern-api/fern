import { Arguments } from "@fern-api/base-generator";
import { csharp } from "@fern-api/csharp-codegen";

import { HttpEndpoint, HttpMethod } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { getContentTypeFromRequestBody } from "../utils/getContentTypeFromRequestBody";

export declare namespace RawClient {
    export type RequestBodyType = "json" | "bytes";

    export interface MakeRequestArgs {
        baseUrl: csharp.CodeBlock;
        /** the reference to the client */
        clientReference: string;
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
     * Constructs a request to the RawClient.
     */
    public makeRequest({
        baseUrl,
        endpoint,
        bodyReference,
        clientReference,
        pathParameterReferences,
        headerBagReference,
        queryBagReference,
        requestType
    }: RawClient.MakeRequestArgs): csharp.MethodInvocation {
        const arguments_: Arguments = [
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
                    `${this.getPathString({
                        endpoint,
                        pathParameterReferences: pathParameterReferences ?? {}
                    })}`
                )
            }
        ];
        if (bodyReference != null) {
            arguments_.push({
                name: "Body",
                assignment: csharp.codeblock(bodyReference)
            });
        }
        if (queryBagReference != null) {
            arguments_.push({
                name: "Query",
                assignment: csharp.codeblock(queryBagReference)
            });
        }
        if (headerBagReference != null) {
            arguments_.push({
                name: "Headers",
                assignment: csharp.codeblock(headerBagReference)
            });
        }
        const requestContentType = getContentTypeFromRequestBody(endpoint);
        if (requestContentType) {
            arguments_.push({
                name: "ContentType",
                assignment: csharp.codeblock(`"${requestContentType}"`)
            });
        }
        if (endpoint.idempotent) {
            arguments_.push({
                name: "Options",
                assignment: csharp.codeblock(this.context.getIdempotentRequestOptionsParameterName())
            });
        } else {
            arguments_.push({
                name: "Options",
                assignment: csharp.codeblock(this.context.getRequestOptionsParameterName())
            });
        }
        let apiRequest = csharp.instantiateClass({
            arguments_,
            classReference: csharp.classReference({
                name: "RawClient.JsonApiRequest",
                namespace: this.context.getCoreNamespace()
            })
        });
        if (requestType === "bytes") {
            apiRequest = csharp.instantiateClass({
                arguments_,
                classReference: csharp.classReference({
                    name: "RawClient.StreamApiRequest",
                    namespace: this.context.getCoreNamespace()
                })
            });
        }
        return csharp.invokeMethod({
            on: csharp.codeblock(clientReference),
            method: "MakeRequestAsync",
            arguments_: [apiRequest, csharp.codeblock(this.context.getCancellationTokenParameterName())],
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

    private getPathString({
        endpoint,
        pathParameterReferences
    }: {
        endpoint: HttpEndpoint;
        pathParameterReferences: Record<string, string>;
    }): string {
        let path = endpoint.fullPath.head;
        let pathParametersPresent = false;
        for (const part of endpoint.fullPath.parts) {
            pathParametersPresent = true;
            const reference = pathParameterReferences[part.pathParameter];
            if (reference == null) {
                throw new Error(
                    `Failed to find request parameter for the endpoint ${endpoint.id} with path parameter ${part.pathParameter}`
                );
            }
            path += `{${reference}}${part.tail}`;
        }
        if (pathParametersPresent) {
            return `$"${path}"`;
        }
        return `"${path}"`;
    }
}
