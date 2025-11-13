import { fail } from "node:assert";
import { Arguments } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { ast, WithGeneration, Writer } from "@fern-api/csharp-codegen";
import { FernIr } from "@fern-fern/ir-sdk";
import { HttpEndpoint, HttpMethod } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { EndpointRequest } from "../request/EndpointRequest";
import { getContentTypeFromRequestBody } from "../utils/getContentTypeFromRequestBody";

export declare namespace RawClient {
    export type RequestBodyType = "json" | "bytes" | "multipartform" | "urlencoded";

    export interface CreateHttpRequestArgs {
        /** The reference to the client */
        clientReference: string;
        /** The instance of the request wrapper */
        request: ast.AstNode;
    }

    export interface SendRequestArgsWithRequestWrapper {
        /** The reference to the client */
        clientReference: string;
        /** The instance of the request wrapper */
        request: ast.AstNode;
    }

    export interface SendRequestWithHttpRequestArgs {
        /** The reference to the client */
        clientReference: string;
        /** Request options */
        options: ast.CodeBlock;
        /** The instance of the request wrapper */
        request: ast.CodeBlock | ast.ClassInstantiation;
        /** Cancellation token */
        cancellationToken: ast.CodeBlock;
    }

    export interface CreateHttpRequestWrapperArgs {
        baseUrl: ast.CodeBlock;
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
        code?: ast.CodeBlock;
        requestReference: ast.AstNode;
    }
}

/**
 * Utility class that helps make calls to the raw client.
 */
export class RawClient extends WithGeneration {
    public constructor(private readonly context: SdkGeneratorContext) {
        super(context.generation);
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
                assignment: this.csharp.codeblock(
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
                assignment: this.csharp.codeblock(bodyReference)
            });
        }
        if (queryBagReference != null) {
            args.push({
                name: "Query",
                assignment: this.csharp.codeblock(queryBagReference)
            });
        }
        if (headerBagReference != null) {
            args.push({
                name: "Headers",
                assignment: this.csharp.codeblock(headerBagReference)
            });
        }
        const requestContentType = getContentTypeFromRequestBody(endpoint);
        if (requestContentType) {
            args.push({
                name: "ContentType",
                assignment: this.csharp.codeblock(`"${requestContentType}"`)
            });
        }
        if (endpoint.idempotent) {
            args.push({
                name: "Options",
                assignment: this.csharp.codeblock(this.names.parameters.idempotentOptions)
            });
        } else {
            args.push({
                name: "Options",
                assignment: this.csharp.codeblock(this.names.parameters.requestOptions)
            });
        }
        switch (requestType) {
            case "bytes":
                return {
                    requestReference: this.csharp.instantiateClass({
                        arguments_: args,
                        classReference: this.csharp.classReference({
                            name: "StreamRequest",
                            namespace: this.namespaces.core
                        })
                    })
                };
            case "multipartform": {
                if (endpoint.requestBody?.type !== "fileUpload") {
                    throw new Error("Internal error; Multipart form requests are only supported for file uploads");
                }
                const requestBody = endpoint.requestBody;
                const varName = "multipartFormRequest_";
                const createMultipartFormRequest = this.csharp.codeblock((writer) => {
                    writer.write(`var ${varName} = `);
                    writer.writeNode(
                        this.csharp.instantiateClass({
                            arguments_: args,
                            classReference: this.csharp.classReference({
                                name: "MultipartFormRequest",
                                namespace: this.namespaces.core
                            })
                        })
                    );
                    writer.writeSemicolonIfLastCharacterIsNot();
                    writer.writeLine();
                    for (const property of requestBody.properties) {
                        const { propertyName, partName, contentType, csharpType, encoding } =
                            this.getMultipartPartParameters(property);
                        const addMultipartPartMethodName = this.getAddMultipartPartMethodName({ csharpType, encoding });
                        const requestReference = endpointRequest?.getParameterName() ?? "request";
                        writer.write(
                            `multipartFormRequest_.${addMultipartPartMethodName}("${partName}", ${requestReference}.${propertyName}`
                        );
                        if (contentType != null) {
                            writer.write(`, "${contentType}"`);
                        }
                        writer.writeTextStatement(")");
                    }
                });
                return {
                    code: createMultipartFormRequest,
                    requestReference: this.csharp.codeblock(varName)
                };
            }

            case "urlencoded":
                return {
                    requestReference: this.Types.FormRequest.new({ arguments_: args })
                };

            case "json":
            default:
                return {
                    requestReference: this.csharp.instantiateClass({
                        arguments_: args,
                        classReference: this.Types.JsonRequest
                    })
                };
        }
    }

    private getMultipartPartParameters(property: FernIr.FileUploadRequestProperty): {
        propertyName: string;
        partName: string;
        contentType: string | undefined;
        csharpType: ast.Type;
        encoding: FernIr.FileUploadBodyPropertyEncoding | undefined;
    } {
        let propertyName: string;
        let partName: string;
        let contentType: string | undefined;
        let csharpType: ast.Type;
        let encoding: FernIr.FileUploadBodyPropertyEncoding | undefined;
        switch (property.type) {
            case "file":
                propertyName = property.value.key.name.pascalCase.safeName;
                partName = property.value.key.wireValue;
                contentType = property.value.contentType;
                csharpType = this.context.csharpTypeMapper.convertFromFileProperty({ property: property.value });
                break;
            case "bodyProperty": {
                propertyName = property.name.name.pascalCase.safeName;
                partName = property.name.wireValue;
                contentType = property.contentType;
                encoding = property.style;
                csharpType = this.context.csharpTypeMapper.convert({
                    reference: property.valueType
                });
                break;
            }
            default:
                assertNever(property);
        }
        return {
            propertyName,
            partName,
            contentType,
            csharpType,
            encoding
        };
    }

    private getAddMultipartPartMethodName({
        csharpType,
        encoding
    }: {
        csharpType: ast.Type;
        encoding?: FernIr.FileUploadBodyPropertyEncoding;
    }): string {
        if (encoding != null) {
            switch (encoding) {
                case "exploded":
                    return csharpType.asNonOptional().isCollection
                        ? "AddExplodedFormEncodedParts"
                        : "AddExplodedFormEncodedPart";
                case "form":
                    return csharpType.asNonOptional().isCollection ? "AddFormEncodedParts" : "AddFormEncodedPart";
                case "json":
                    return csharpType.asNonOptional().isCollection ? "AddJsonParts" : "AddJsonPart";
                default:
                    assertNever(encoding);
            }
        } else {
            return (
                csharpType.multipartMethodName ??
                fail(`Type ${csharpType.fullyQualifiedName} does not support adding to a multipart form`)
            );
        }
    }

    /**
     * Creates an HTTP request using the RawClient.
     */
    public createHttpRequest({ clientReference, request }: RawClient.CreateHttpRequestArgs): ast.MethodInvocation {
        return this.csharp.invokeMethod({
            on: this.csharp.codeblock(clientReference),
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
    }: RawClient.SendRequestArgsWithRequestWrapper): ast.MethodInvocation {
        return this.csharp.invokeMethod({
            on: this.csharp.codeblock(clientReference),
            method: "SendRequestAsync",
            arguments_: [request, this.csharp.codeblock(this.names.parameters.cancellationToken)],
            async: true
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
    }: RawClient.SendRequestWithHttpRequestArgs): ast.MethodInvocation {
        return this.csharp.invokeMethod({
            on: this.csharp.codeblock(clientReference),
            method: "SendRequestAsync",
            arguments_: [request, options, this.csharp.codeblock(this.names.parameters.cancellationToken)],
            async: true
        });
    }

    private getCsharpHttpMethod(irMethod: HttpMethod): ast.CodeBlock {
        let method: string;
        switch (irMethod) {
            case "POST":
                method = "Post";
                break;
            case "DELETE":
                method = "Delete";
                break;
            case "PATCH":
                return this.csharp.codeblock((writer) => {
                    writer.write(this.Types.HttpMethodExtensions, ".Patch");
                });
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
        return this.csharp.codeblock((writer) => {
            writer.writeNode(this.System.Net.Http.HttpMethod);
            writer.write(`.${method}`);
        });
    }

    private writePathString({
        writer,
        endpoint,
        pathParameterReferences
    }: {
        writer: Writer;
        endpoint: HttpEndpoint;
        pathParameterReferences: Record<string, string>;
    }): void {
        const hasPathParameters = endpoint.fullPath.parts.some((part) => part.pathParameter != null);
        if (!hasPathParameters) {
            writer.write(`"${endpoint.fullPath.head}"`);
            return;
        }
        writer.write(`string.Format("${endpoint.fullPath.head}`);
        const formatParams: ast.AstNode[] = [];
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
                this.csharp.codeblock((writer) => {
                    writer.writeNode(this.Types.ValueConvert);
                    writer.write(`.ToPathParameterString(${reference})`);
                })
            );
            writer.write(part.tail);
        }
        writer.write('"');
        if (formatParams.length > 0) {
            writer.write(", ");
            for (let i = 0; i < formatParams.length; i++) {
                writer.writeNode(formatParams[i] as ast.AstNode);
                if (i < formatParams.length - 1) {
                    writer.write(", ");
                }
            }
        }
        writer.write(")");
    }
}
