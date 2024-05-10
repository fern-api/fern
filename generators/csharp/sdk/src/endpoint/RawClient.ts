import { csharp } from "@fern-api/csharp-codegen";
import { HttpEndpoint, HttpMethod } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace RawClient {
    export interface MakeRequestArgs {
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
    }
}

/**
 * Utility class that helps make calls to the raw client
 */
export class RawClient {
    private context: SdkGeneratorContext;

    public constructor(context: SdkGeneratorContext) {
        this.context = context;
    }

    /**
     * Constructs a request to the RawClient
     */
    public makeRequest({
        endpoint,
        bodyReference,
        clientReference,
        pathParameterReferences,
        headerBagReference,
        queryBagReference
    }: RawClient.MakeRequestArgs): csharp.MethodInvocation {
        const arguments_: csharp.ClassInstantiation.Arguments = [
            {
                name: "Method",
                assignment: this.getCsharpHttpMethod(endpoint.method)
            },
            {
                name: "Path",
                assignment: csharp.codeblock(
                    `${this.getPathString({ endpoint, pathParameterReferences: pathParameterReferences ?? {} })}`
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
        const apiRequest = csharp.instantiateClass({
            arguments_,
            classReference: csharp.classReference({
                name: "RawClient.ApiRequest",
                namespace: this.context.getCoreNamespace()
            })
        });
        return csharp.invokeMethod({
            arguments_: [apiRequest],
            method: "MakeRequestAsync",
            on: csharp.codeblock(clientReference),
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
                method = "Patch";
                break;
            case "GET":
                method = "Get";
                break;
            case "PUT":
                method = "Put";
                break;
        }
        return csharp.codeblock(`HttpMethod.${method}`);
    }

    private getPathString({
        endpoint,
        pathParameterReferences
    }: {
        endpoint: HttpEndpoint;
        pathParameterReferences: Record<string, string>;
    }): string {
        let path = endpoint.path.head;
        let pathParametersPresent = false;
        for (const part of endpoint.path.parts) {
            pathParametersPresent = true;
            const reference = pathParameterReferences[part.pathParameter];
            if (reference == null) {
                throw new Error(
                    `Failed to find request parameter for the endpointt ${endpoint.id} with path parameter ${part.pathParameter}`
                );
            }
            path += `{${reference}}${part.tail}`;
        }
        if (pathParametersPresent) {
            return `\$"${path}"`;
        }
        return `"${path}"`;
    }
}
