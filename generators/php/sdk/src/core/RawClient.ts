import { Arguments, NamedArgument } from "@fern-api/base-generator";
import { php } from "@fern-api/php-codegen";

import { HttpEndpoint } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace RawClient {
    export interface SendRequestArgs {
        /** The endpoint for the endpoint */
        endpoint: HttpEndpoint;
        /** The reference to the client variable */
        clientReference: string;
        /** The base URL used for the request */
        baseUrl: php.AstNode;
        /** The path parameter IDs to reference */
        pathParameterReferences?: Record<string, string>;
        /** The reference to the header values */
        headerBagReference?: string;
        /** The reference to the query values */
        queryBagReference?: string;
        /** The reference to the request body */
        bodyReference?: php.CodeBlock;
        /** The reference to the request body class */
        requestTypeClassReference: php.ClassReference;
    }
}

/**
 * Utility class that helps make calls to the RawClient.
 */
export class RawClient {
    public static CLASS_NAME = "RawClient";
    public static FIELD_NAME = "client";
    public static SEND_REQUEST_METHOD_NAME = "sendRequest";

    private context: SdkGeneratorContext;

    public constructor(context: SdkGeneratorContext) {
        this.context = context;
    }

    public getClassReference(): php.ClassReference {
        return php.classReference({
            name: RawClient.CLASS_NAME,
            namespace: this.context.getCoreClientNamespace()
        });
    }

    public getFieldName(): string {
        return RawClient.FIELD_NAME;
    }

    public getField(): php.Field {
        return php.field({
            access: "private",
            name: `$${this.getFieldName()}`,
            type: php.Type.reference(this.context.rawClient.getClassReference())
        });
    }

    public instantiate({ arguments_ }: { arguments_: Arguments }): php.ClassInstantiation {
        return php.instantiateClass({
            classReference: this.getClassReference(),
            arguments_,
            multiline: true
        });
    }

    public sendRequest(args: RawClient.SendRequestArgs): php.AstNode {
        const arguments_: NamedArgument[] = [
            {
                name: "baseUrl",
                assignment: args.baseUrl
            },
            {
                name: "path",
                assignment: php.codeblock(
                    `"${this.getPathString({
                        endpoint: args.endpoint,
                        pathParameterReferences: args.pathParameterReferences ?? {}
                    })}"`
                )
            },
            {
                name: "method",
                assignment: this.context.getHttpMethod(args.endpoint.method)
            }
        ];
        if (args.headerBagReference != null) {
            arguments_.push({
                name: "headers",
                assignment: php.codeblock(args.headerBagReference)
            });
        }
        if (args.queryBagReference != null) {
            arguments_.push({
                name: "query",
                assignment: php.codeblock(args.queryBagReference)
            });
        }
        if (args.bodyReference != null) {
            arguments_.push({
                name: "body",
                assignment: args.bodyReference
            });
        }
        return php.codeblock((writer) => {
            writer.writeNode(
                php.invokeMethod({
                    on: php.codeblock(args.clientReference),
                    method: RawClient.SEND_REQUEST_METHOD_NAME,
                    arguments_: [
                        php.instantiateClass({
                            classReference: args.requestTypeClassReference,
                            arguments_,
                            multiline: true
                        })
                    ],
                    multiline: true
                })
            );
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
        for (const part of endpoint.fullPath.parts) {
            const reference = pathParameterReferences[part.pathParameter];
            if (reference == null) {
                throw new Error(
                    `Failed to find request parameter for the endpoint ${endpoint.id} with path parameter ${part.pathParameter}`
                );
            }
            path += `$${reference}${part.tail}`;
        }
        return path;
    }
}
