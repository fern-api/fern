import { upperFirst } from "lodash-es";

import { Arguments, UnnamedArgument } from "@fern-api/base-generator";
import { php } from "@fern-api/php-codegen";

import {
    BytesRequest,
    FileUploadRequest,
    HttpEndpoint,
    HttpRequestBody,
    HttpRequestBodyReference,
    InlinedRequestBody,
    ServiceId
} from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { AbstractEndpointGenerator } from "../AbstractEndpointGenerator";
import { getEndpointReturnType } from "../utils/getEndpointReturnType";

export declare namespace EndpointGenerator {
    export interface Args {
        /** the reference to the client */
        clientReference: string;
        /** the endpoint for the endpoint */
        endpoint: HttpEndpoint;
        /** reference to a variable that is the body */
        bodyReference?: string;
    }
}

const JSON_VARIABLE_NAME = "$json";
const RESPONSE_VARIABLE_NAME = "$response";
const STATUS_CODE_VARIABLE_NAME = "$statusCode";

export class HttpEndpointGenerator extends AbstractEndpointGenerator {
    public constructor({ context }: { context: SdkGeneratorContext }) {
        super({ context });
    }

    public generate({ serviceId, endpoint }: { serviceId: ServiceId; endpoint: HttpEndpoint }): php.Method {
        const endpointSignatureInfo = this.getEndpointSignatureInfo({ serviceId, endpoint });
        const parameters = [...endpointSignatureInfo.baseParameters];
        parameters.push(
            php.parameter({
                name: `$${this.context.getRequestOptionsName()}`,
                type: php.Type.optional(this.context.getRequestOptionsType())
            })
        );
        const return_ = getEndpointReturnType({ context: this.context, endpoint });
        return php.method({
            name: this.context.getEndpointMethodName(endpoint),
            access: "public",
            parameters,
            docs: endpoint.docs,
            return_,
            throws: [this.context.getBaseExceptionClassReference(), this.context.getBaseApiExceptionClassReference()],
            body: php.codeblock((writer) => {
                const queryParameterCodeBlock = endpointSignatureInfo.request?.getQueryParameterCodeBlock();
                if (queryParameterCodeBlock != null) {
                    queryParameterCodeBlock.code.write(writer);
                }
                const headerParameterCodeBlock = endpointSignatureInfo.request?.getHeaderParameterCodeBlock();
                if (headerParameterCodeBlock != null) {
                    headerParameterCodeBlock.code.write(writer);
                }
                const requestBodyCodeBlock = endpointSignatureInfo.request?.getRequestBodyCodeBlock();
                if (requestBodyCodeBlock?.code != null) {
                    writer.writeNode(requestBodyCodeBlock.code);
                }

                writer.writeLine("try {");
                writer.indent();
                writer.write(`${RESPONSE_VARIABLE_NAME} = `);

                const classReference =
                    endpoint.requestBody != null
                        ? this.getRequestTypeClassReference(endpoint.requestBody)
                        : this.context.getJsonApiRequestClassReference();
                writer.writeNodeStatement(
                    this.context.rawClient.sendRequest({
                        clientReference: `$this->${this.context.rawClient.getFieldName()}`,
                        baseUrl: this.getBaseURLForEndpoint({ endpoint }),
                        endpoint,
                        bodyReference: requestBodyCodeBlock?.requestBodyReference,
                        pathParameterReferences: endpointSignatureInfo.pathParameterReferences,
                        headerBagReference: headerParameterCodeBlock?.headerParameterBagReference,
                        queryBagReference: queryParameterCodeBlock?.queryParameterBagReference,
                        requestTypeClassReference: classReference
                    })
                );
                writer.writeTextStatement(`${STATUS_CODE_VARIABLE_NAME} = ${RESPONSE_VARIABLE_NAME}->getStatusCode()`);
                const successResponseStatements = this.getEndpointSuccessResponseStatements({ endpoint, return_ });
                if (successResponseStatements != null) {
                    writer.writeNode(successResponseStatements);
                }
                writer.dedent();
                writer.write("} catch (");
                writer.writeNode(this.context.getClientExceptionInterfaceClassReference());
                writer.writeLine(" $e) {");
                writer.indent();
                writer.writeNodeStatement(
                    this.throwNewBaseException({
                        message: php.codeblock("$e->getMessage()")
                    })
                );
                writer.dedent();
                writer.writeLine("}");

                writer.writeNode(this.getEndpointErrorHandling({ endpoint }));
            })
        });
    }

    private getRequestTypeClassReference(requestBody: HttpRequestBody): php.ClassReference {
        return requestBody._visit({
            inlinedRequestBody: () => this.context.getJsonApiRequestClassReference(),
            reference: () => this.context.getJsonApiRequestClassReference(),
            fileUpload: () => this.context.getMultipartApiRequestClassReference(),
            bytes: () => this.context.getJsonApiRequestClassReference(), // TODO: Add support for BytesApiRequest
            _other: () => this.context.getJsonApiRequestClassReference()
        });
    }

    private getBaseURLForEndpoint({ endpoint }: { endpoint: HttpEndpoint }): php.CodeBlock {
        return php.codeblock((writer) => {
            const rawClientFieldName = this.context.rawClient.getFieldName();
            const clientOptionsName = this.context.getClientOptionsName();
            const requestOptionName = this.context.getRequestOptionsName();
            const baseUrlOptionName = this.context.getBaseUrlOptionName();
            const defaultBaseUrl = this.context.getDefaultBaseUrlForEndpoint(endpoint);

            writer.write(
                `$${requestOptionName}['${baseUrlOptionName}'] ?? $this->${rawClientFieldName}->${clientOptionsName}['${baseUrlOptionName}'] ?? `
            );
            writer.writeNode(defaultBaseUrl);
        });
    }

    private getEndpointErrorHandling({ endpoint }: { endpoint: HttpEndpoint }): php.CodeBlock {
        return php.codeblock((writer) => {
            writer.writeNodeStatement(
                this.throwNewBaseAPiException({
                    message: php.codeblock("'API request failed'"),
                    body: php.codeblock(`${RESPONSE_VARIABLE_NAME}->getBody()->getContents()`)
                })
            );
        });
    }

    private getEndpointSuccessResponseStatements({
        endpoint,
        return_
    }: {
        endpoint: HttpEndpoint;
        return_: php.Type | undefined;
    }): php.CodeBlock | undefined {
        if (endpoint.response?.body == null) {
            return php.codeblock((writer) => {
                writer.controlFlow(
                    "if",
                    php.codeblock(`${STATUS_CODE_VARIABLE_NAME} >= 200 && ${STATUS_CODE_VARIABLE_NAME} < 400`)
                );
                writer.writeLine("return;");
                writer.endControlFlow();
            });
        }
        const body = endpoint.response.body;
        return php.codeblock((writer) => {
            body._visit({
                streamParameter: () => this.context.logger.error("Stream parameters not supported"),
                fileDownload: () => this.context.logger.error("File download not supported"),
                json: (_reference) => {
                    writer.controlFlow(
                        "if",
                        php.codeblock(`${STATUS_CODE_VARIABLE_NAME} >= 200 && ${STATUS_CODE_VARIABLE_NAME} < 400`)
                    );
                    if (return_ == null) {
                        writer.write("return;");
                        writer.endControlFlow();
                        return;
                    }
                    writer.writeNodeStatement(this.getResponseBodyContent());
                    if (return_.isOptional()) {
                        writer.controlFlow("if", php.codeblock(`empty(${JSON_VARIABLE_NAME})`));
                        writer.writeTextStatement("return null");
                        writer.endControlFlow();
                    }
                    writer.write("return ");
                    writer.writeNode(this.decodeJsonResponse(return_));
                    writer.endControlFlow();
                    writer.write("} catch (");
                    writer.writeNode(this.context.getJsonExceptionClassReference());
                    writer.writeLine(" $e) {");
                    writer.indent();
                    writer.writeNodeStatement(
                        this.throwNewBaseException({
                            message: php.codeblock('"Failed to deserialize response: {$e->getMessage()}"')
                        })
                    );
                    writer.dedent();
                },
                streaming: () => this.context.logger.error("Streaming not supported"),
                text: () => {
                    writer.controlFlow(
                        "if",
                        php.codeblock(`${STATUS_CODE_VARIABLE_NAME} >= 200 && ${STATUS_CODE_VARIABLE_NAME} < 400`)
                    );
                    writer.writeTextStatement(`return ${RESPONSE_VARIABLE_NAME}->getBody()->getContents()`);
                    writer.endControlFlow();
                },
                _other: () => undefined
            });
        });
    }

    private decodeJsonResponse(return_: php.Type | undefined): php.CodeBlock {
        if (return_ == null) {
            return php.codeblock("");
        }
        const arguments_: UnnamedArgument[] = [php.codeblock(JSON_VARIABLE_NAME)];
        const internalType = return_.underlyingType().internalType;
        switch (internalType.type) {
            case "reference":
                return this.decodeJsonResponseForClassReference({
                    arguments_,
                    classReference: internalType.value
                });
            case "array":
            case "map":
                return this.decodeJsonResponseForArray({
                    arguments_,
                    type: return_.underlyingType()
                });
            case "int":
            case "float":
            case "string":
            case "bool":
            case "date":
            case "dateTime":
            case "mixed":
                return this.decodeJsonResponseForPrimitive({
                    arguments_,
                    methodSuffix: upperFirst(internalType.type)
                });
            case "enumString":
                return this.decodeJsonResponseForPrimitive({
                    arguments_,
                    methodSuffix: "String"
                });
            case "union":
                return this.decodeJsonResponseForUnion({
                    arguments_,
                    types: internalType.types
                });
            case "object":
            case "optional":
            case "typeDict":
                throw new Error(`Internal error; '${internalType.type}' type is not a supported return type`);
        }
    }

    private decodeJsonResponseForClassReference({
        arguments_,
        classReference
    }: {
        arguments_: Arguments;
        classReference: php.ClassReference;
    }): php.CodeBlock {
        return php.codeblock((writer) => {
            writer.writeNodeStatement(
                php.invokeMethod({
                    on: classReference,
                    method: "fromJson",
                    arguments_,
                    static_: true
                })
            );
        });
    }

    private decodeJsonResponseForArray({
        arguments_,
        type
    }: {
        arguments_: UnnamedArgument[];
        type: php.Type;
    }): php.CodeBlock {
        return php.codeblock((writer) => {
            writer.writeNode(
                php.invokeMethod({
                    on: this.context.getJsonDecoderClassReference(),
                    method: "decodeArray",
                    arguments_: [...arguments_, this.context.phpAttributeMapper.getTypeAttributeArgument(type)],
                    static_: true
                })
            );
            writer.write(";");
            if (this.context.isMixedArray(type)) {
                writer.newLine();
                return;
            }
            writer.writeLine(" // @phpstan-ignore-line");
        });
    }

    private decodeJsonResponseForPrimitive({
        arguments_,
        methodSuffix
    }: {
        arguments_: Arguments;
        methodSuffix: string;
    }): php.CodeBlock {
        return php.codeblock((writer) => {
            writer.writeNodeStatement(
                php.invokeMethod({
                    on: this.context.getJsonDecoderClassReference(),
                    method: `decode${methodSuffix}`,
                    arguments_,
                    static_: true
                })
            );
        });
    }

    private decodeJsonResponseForUnion({
        arguments_,
        types
    }: {
        arguments_: UnnamedArgument[];
        types: php.Type[];
    }): php.CodeBlock {
        const unionTypeParameters = this.context.phpAttributeMapper.getUnionTypeParameters({ types });
        // if deduping in getUnionTypeParameters results in one type, treat it like just that type
        if (unionTypeParameters.length === 1) {
            return this.decodeJsonResponse(types[0]);
        }
        return php.codeblock((writer) => {
            writer.writeNode(
                php.invokeMethod({
                    on: this.context.getJsonDecoderClassReference(),
                    method: "decodeUnion",
                    arguments_: [
                        ...arguments_,
                        this.context.phpAttributeMapper.getUnionTypeClassRepresentation(unionTypeParameters)
                    ],
                    static_: true
                })
            );
            writer.writeLine("; // @phpstan-ignore-line");
        });
    }

    private getResponseBodyContent(): php.CodeBlock {
        return php.codeblock((writer) => {
            writer.write(`${JSON_VARIABLE_NAME} = ${RESPONSE_VARIABLE_NAME}->getBody()->getContents()`);
        });
    }

    private throwNewBaseException({ message }: { message: php.CodeBlock }): php.CodeBlock {
        return php.codeblock((writer) => {
            writer.write("throw ");
            writer.writeNode(
                php.instantiateClass({
                    classReference: this.context.getBaseExceptionClassReference(),
                    arguments_: [
                        {
                            name: "message",
                            assignment: message
                        },
                        {
                            name: "previous",
                            assignment: php.codeblock("$e")
                        }
                    ]
                })
            );
        });
    }

    private throwNewBaseAPiException({
        message,
        body
    }: {
        message: php.CodeBlock;
        body: php.CodeBlock;
    }): php.CodeBlock {
        return php.codeblock((writer) => {
            writer.write("throw ");
            writer.writeNode(
                php.instantiateClass({
                    classReference: this.context.getBaseApiExceptionClassReference(),
                    arguments_: [
                        {
                            name: "message",
                            assignment: message
                        },
                        {
                            name: "statusCode",
                            assignment: php.codeblock(STATUS_CODE_VARIABLE_NAME)
                        },
                        {
                            name: "body",
                            assignment: body
                        }
                    ],
                    multiline: true
                })
            );
        });
    }
}
