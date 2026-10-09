import { Arguments, GeneratorError, NamedArgument } from "@fern-api/base-generator";
import { php } from "@fern-api/php-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

export declare namespace RawClient {
    export interface SendRequestArgs {
        /** The endpoint for the endpoint */
        endpoint: FernIr.HttpEndpoint;
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
        /** Whether a call that carries no body must also carry no body content type */
        omitContentTypeWithoutBody?: boolean;
        /** The reference to the options argument */
        optionsArgument?: php.AstNode;
    }
}

/**
 * Utility class that helps make calls to the RawClient.
 */
export class RawClient {
    public static CLASS_NAME = "RawClient";
    public static FIELD_NAME = "client";
    public static SEND_REQUEST_METHOD_NAME = "sendRequest";
    public static ENCODE_PATH_PARAM_METHOD_NAME = "encodePathParam";

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
                assignment: this.getPathString({
                    endpoint: args.endpoint,
                    pathParameterReferences: args.pathParameterReferences ?? {}
                })
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
        if (args.omitContentTypeWithoutBody) {
            arguments_.push({
                name: "omitContentTypeWithoutBody",
                assignment: php.codeblock("true")
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
                        }),
                        args.optionsArgument ?? php.codeblock("[]")
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
        endpoint: FernIr.HttpEndpoint;
        pathParameterReferences: Record<string, string>;
    }): php.AstNode {
        if (!this.context.customConfig.encodePathParams) {
            return php.codeblock(this.getInterpolatedPathString({ endpoint, pathParameterReferences }));
        }
        // Build the request path by concatenating the literal segments of the path template with
        // each path parameter value passed through RawClient::encodePathParam(). Encoding the
        // values here, rather than after the path is assembled, keeps the literal "/" separators
        // intact while preventing a value from resolving the request to a different endpoint.
        const parts: { literal: string; reference: string }[] = [];
        let literal = endpoint.fullPath.head;
        for (const part of endpoint.fullPath.parts) {
            const reference = pathParameterReferences[part.pathParameter];
            if (reference == null) {
                throw GeneratorError.internalError(
                    `Failed to find request parameter for the endpoint ${endpoint.id} with path parameter ${part.pathParameter}`
                );
            }
            parts.push({ literal, reference });
            literal = part.tail;
        }
        const trailingLiteral = literal;
        return php.codeblock((writer) => {
            if (parts.length === 0) {
                writer.write(`"${trailingLiteral}"`);
                return;
            }
            parts.forEach(({ literal: leadingLiteral, reference }, index) => {
                if (index > 0) {
                    writer.write(" . ");
                }
                if (leadingLiteral.length > 0) {
                    writer.write(`"${leadingLiteral}" . `);
                }
                writer.writeNode(this.getClassReference());
                writer.write(`::${RawClient.ENCODE_PATH_PARAM_METHOD_NAME}(${reference})`);
            });
            if (trailingLiteral.length > 0) {
                writer.write(` . "${trailingLiteral}"`);
            }
        });
    }

    /**
     * Builds a double-quoted PHP string expression for the request path, interpolating path
     * parameter values without encoding them. Used when the encode-path-params config is disabled.
     * Most references can be interpolated directly (e.g. "/users/{$id}"), but some are expressions
     * (e.g. a boolean rendered as "true"/"false") that must be concatenated instead.
     */
    private getInterpolatedPathString({
        endpoint,
        pathParameterReferences
    }: {
        endpoint: FernIr.HttpEndpoint;
        pathParameterReferences: Record<string, string>;
    }): string {
        const segments: string[] = [];
        let literal = endpoint.fullPath.head;
        for (const part of endpoint.fullPath.parts) {
            const reference = pathParameterReferences[part.pathParameter];
            if (reference == null) {
                throw GeneratorError.internalError(
                    `Failed to find request parameter for the endpoint ${endpoint.id} with path parameter ${part.pathParameter}`
                );
            }
            if (RawClient.isInterpolatableReference(reference)) {
                literal += `{${reference}}${part.tail}`;
            } else {
                segments.push(`"${literal}"`);
                segments.push(`(${reference})`);
                literal = part.tail;
            }
        }
        if (segments.length === 0) {
            return `"${literal}"`;
        }
        if (literal.length > 0) {
            segments.push(`"${literal}"`);
        }
        return segments.join(" . ");
    }

    /**
     * Returns true when the reference is a simple variable, property, getter, or index access that
     * can be embedded directly inside a double-quoted PHP string (e.g. `$id`, `$request->id`,
     * `$request->getId()`, `$map['key']`). Anything else (e.g. a ternary expression) must be
     * concatenated rather than interpolated.
     */
    private static isInterpolatableReference(reference: string): boolean {
        return /^\$[A-Za-z_]\w*(?:->[A-Za-z_]\w*(?:\(\))?|\['[^']*'\]|\[\d+\])*$/.test(reference);
    }
}
