import { csharp } from "@fern-api/csharp-codegen";
import { CodeBlock } from "@fern-api/csharp-codegen/src/ast";
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
        clientReference
    }: RawClient.MakeRequestArgs): csharp.MethodInvocation {
        const arguments_: csharp.ClassInstantiation.Arguments = [
            {
                name: "Method",
                assignment: this.getCsharpHttpMethod(endpoint.method)
            },
            {
                name: "Path",
                assignment: csharp.codeblock(`"${this.getPath(endpoint)}"`)
            }
        ];
        if (bodyReference != null) {
            arguments_.push({
                name: "Body",
                assignment: csharp.codeblock(bodyReference)
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
            method: `MakeRequestAsync`,
            on: csharp.codeblock(clientReference),
            async: true
        });
    }

    private getCsharpHttpMethod(irMethod: HttpMethod): CodeBlock {
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

    private getPath(endpoint: HttpEndpoint): string {
        let path = endpoint.path.head;
        for (const part of endpoint.path.parts) {
            path += `/${part.pathParameter}${part.tail}`;
        }
        return path;
    }
}
