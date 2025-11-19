import { assertNever } from "@fern-api/core-utils";
import { ruby } from "@fern-api/ruby-ast";
import { ContainerType, HttpEndpoint, Literal, PathParameter, PrimitiveType, ServiceId, TypeReference } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { getEndpointRequest } from "../utils/getEndpointRequest";
import { getEndpointReturnType } from "../utils/getEndpointReturnType";
import { RAW_CLIENT_REQUEST_VARIABLE_NAME, RawClient } from "./RawClient";

export declare namespace HttpEndpointGenerator {
    export interface GenerateArgs {
        endpoint: HttpEndpoint;
        serviceId: ServiceId;
    }
}

const QUERY_PARAMETER_BAG_NAME = "_query";
export const HTTP_RESPONSE_VN = "_response";
export const PARAMS_VN = "params";
export const CODE_VN = "code";
export const ERROR_CLASS_VN = "error_class";

export class HttpEndpointGenerator {
    private context: SdkGeneratorContext;

    public constructor({ context }: { context: SdkGeneratorContext }) {
        this.context = context;
    }

    public generate({ endpoint, serviceId }: HttpEndpointGenerator.GenerateArgs): ruby.Method[] {
        return [this.generateUnpagedMethod({ endpoint, serviceId })];
    }

    private generateUnpagedMethod({
        endpoint,
        serviceId
    }: {
        endpoint: HttpEndpoint;
        serviceId: ServiceId;
    }): ruby.Method {
        const rawClient = new RawClient(this.context);

        const returnType = getEndpointReturnType({ context: this.context, endpoint });

        const request = getEndpointRequest({
            context: this.context,
            endpoint,
            serviceId
        });

        const statements: ruby.AstNode[] = [];

        const requestBodyCodeBlock = request?.getRequestBodyCodeBlock();
        if (requestBodyCodeBlock?.code != null) {
            statements.push(requestBodyCodeBlock.code);
        }

        const queryParameterCodeBlock = request?.getQueryParameterCodeBlock(QUERY_PARAMETER_BAG_NAME);
        if (queryParameterCodeBlock?.code != null) {
            statements.push(queryParameterCodeBlock.code);
        }

        const pathParameterReferences = this.getPathParameterReferences({ endpoint });
        const sendRequestCodeBlock = rawClient.sendRequest({
            baseUrl: ruby.codeblock(""),
            pathParameterReferences,
            endpoint,
            requestType: request?.getRequestType(),
            queryBagReference: queryParameterCodeBlock?.queryParameterBagReference,
            bodyReference: requestBodyCodeBlock?.requestBodyReference
        });

        let requestStatements = this.generateRequestProcedure({ endpoint, sendRequestCodeBlock });

        const enhancedDocstring = this.generateEnhancedDocstring({ endpoint, request });

        if (endpoint.pagination) {
            switch (endpoint.pagination.type) {
                case "custom":
                    break;
                case "cursor":
                    requestStatements = [
                        ruby.invokeMethod({
                            on: ruby.classReference({
                                name: "CursorItemIterator",
                                modules: [this.context.getRootModuleName(), "Internal"]
                            }),
                            method: "new",
                            arguments_: [],
                            keywordArguments: [
                                ruby.keywordArgument({
                                    name: "cursor_field",
                                    value: ruby.codeblock(`:${endpoint.pagination.next.property.name.wireValue}`)
                                }),
                                ruby.keywordArgument({
                                    name: "item_field",
                                    value: ruby.codeblock(`:${endpoint.pagination.results.property.name.wireValue}`)
                                }),
                                ruby.keywordArgument({
                                    name: "initial_cursor",
                                    value: ruby.codeblock(
                                        `${QUERY_PARAMETER_BAG_NAME}[:${endpoint.pagination.page.property.name.wireValue}]`
                                    )
                                })
                            ],
                            block: [
                                ["next_cursor"],
                                [
                                    ruby.codeblock(
                                        `${QUERY_PARAMETER_BAG_NAME}[:${endpoint.pagination.page.property.name.wireValue}] = next_cursor`
                                    ),
                                    ...requestStatements
                                ]
                            ]
                        })
                    ];
                    break;
                case "offset":
                    requestStatements = [
                        ruby.invokeMethod({
                            on: ruby.classReference({
                                name: "OffsetItemIterator",
                                modules: [this.context.getRootModuleName(), "Internal"]
                            }),
                            method: "new",
                            arguments_: [],
                            keywordArguments: [
                                ruby.keywordArgument({
                                    name: "initial_page",
                                    value: ruby.codeblock(
                                        `${QUERY_PARAMETER_BAG_NAME}[:${endpoint.pagination.page.property.name.wireValue}]`
                                    )
                                }),
                                ruby.keywordArgument({
                                    name: "item_field",
                                    value: ruby.codeblock(`:${endpoint.pagination.results.property.name.wireValue}`)
                                }),
                                ruby.keywordArgument({
                                    name: "has_next_field",
                                    value: endpoint.pagination.hasNextPage
                                        ? ruby.codeblock(`:${endpoint.pagination.hasNextPage.property.name.wireValue}`)
                                        : ruby.nilValue()
                                }),
                                ruby.keywordArgument({
                                    name: "step",
                                    value: endpoint.pagination.step ? ruby.trueValue() : ruby.falseValue()
                                })
                            ],
                            block: [
                                ["next_page"],
                                [
                                    ruby.codeblock(
                                        `${QUERY_PARAMETER_BAG_NAME}[:${endpoint.pagination.page.property.name.wireValue}] = next_page`
                                    ),
                                    ...requestStatements
                                ]
                            ]
                        })
                    ];
                    break;
                default:
                    assertNever(endpoint.pagination);
            }
        }

        statements.push(...requestStatements);

        return ruby.method({
            name: endpoint.name.snakeCase.safeName,
            docstring: enhancedDocstring,
            returnType,
            parameters: {
                keyword: [
                    ruby.parameters.keyword({
                        name: "request_options",
                        type: ruby.Type.class_({ name: "RequestOptions", modules: [this.context.getRootModuleName()] }),
                        initializer: ruby.TypeLiteral.hash([])
                    })
                ],
                keywordSplat: ruby.parameters.keywordSplat({
                    name: PARAMS_VN,
                    type: request?.getParameterType() ?? ruby.Type.hash(ruby.Type.untyped(), ruby.Type.untyped())
                })
            },
            statements
        });
    }

    private generateRequestProcedure({
        endpoint,
        sendRequestCodeBlock
    }: {
        endpoint: HttpEndpoint;
        sendRequestCodeBlock?: ruby.CodeBlock;
    }): ruby.AstNode[] {
        const statements: ruby.AstNode[] = [];

        if (sendRequestCodeBlock != null) {
            statements.push(sendRequestCodeBlock);
        } else {
            statements.push(
                ruby.codeblock((writer) => {
                    writer.write(`_request = ${PARAMS_VN}`);
                })
            );
        }

        statements.push(
            ruby.begin({
                body: ruby.codeblock(`${HTTP_RESPONSE_VN} = @client.send(${RAW_CLIENT_REQUEST_VARIABLE_NAME})`),
                rescues: [
                    {
                        errorClass: ruby.classReference({ name: "HTTPRequestTimeout", modules: ["Net"] }),
                        body: ruby.raise({
                            errorClass: ruby.classReference({
                                name: "TimeoutError",
                                modules: [this.context.getRootModuleName(), "Errors"]
                            })
                        })
                    }
                ]
            })
        );

        statements.push(ruby.codeblock(`${CODE_VN} = ${HTTP_RESPONSE_VN}.code.to_i`));

        statements.push(
            ruby.ifElse({
                if: {
                    condition: ruby.codeblock(`${CODE_VN}.between?(200, 299)`),
                    thenBody: [
                        ruby.codeblock((writer) => {
                            if (endpoint.response?.body == null) {
                                writer.writeLine(`return`);
                            } else {
                                switch (endpoint.response.body.type) {
                                    case "json":
                                        this.loadResponseBodyFromJson({
                                            writer,
                                            typeReference: endpoint.response.body.value.responseBodyType
                                        });
                                        break;
                                    default:
                                        break;
                                }
                            }
                        })
                    ]
                },
                elseBody: ruby.codeblock((writer) => {
                    const rootModuleName = this.context.getRootModuleName();
                    writer.writeLine(
                        `${ERROR_CLASS_VN} = ${rootModuleName}::Errors::ResponseError.subclass_for_code(${CODE_VN})`
                    );

                    ruby.raise({
                        errorClass: ruby.codeblock(`${ERROR_CLASS_VN}.new(${HTTP_RESPONSE_VN}.body, code: ${CODE_VN})`)
                    }).write(writer);
                })
            })
        );

        return statements;
    }

    private getPathParameterReferences({ endpoint }: { endpoint: HttpEndpoint }): Record<string, string> {
        const pathParameterReferences: Record<string, string> = {};
        for (const pathParam of endpoint.allPathParameters) {
            const parameterName = this.getPathParameterName({
                pathParameter: pathParam
            });
            pathParameterReferences[pathParam.name.originalName] = `${PARAMS_VN}[:${parameterName}]`;
        }
        return pathParameterReferences;
    }

    private getPathParameterName({ pathParameter }: { pathParameter: PathParameter }): string {
        return pathParameter.name.snakeCase.safeName;
    }

    private loadResponseBodyFromJson({
        writer,
        typeReference
    }: {
        writer: ruby.Writer;
        typeReference: TypeReference;
    }): void {
        switch (typeReference.type) {
            case "named":
                writer.writeLine(
                    `${this.context.getReferenceToTypeId(typeReference.typeId)}.load(${HTTP_RESPONSE_VN}.body)`
                );
                break;
            default:
                break;
        }
    }

    private generateEnhancedDocstring({
        endpoint,
        request
    }: {
        endpoint: HttpEndpoint;
        request: ReturnType<typeof getEndpointRequest>;
    }): string {
        const docParts: string[] = [];

        if (endpoint.docs != null) {
            docParts.push(endpoint.docs);
        }

        const optionTags: string[] = [];

        for (const pathParam of endpoint.allPathParameters) {
            const paramName = pathParam.name.snakeCase.safeName;
            const typeString = this.typeReferenceToYardString(pathParam.valueType);
            optionTags.push(`@option params [${typeString}] :${paramName}`);
        }

        for (const queryParam of endpoint.queryParameters) {
            const paramName = queryParam.name.name.snakeCase.safeName;
            const typeString = this.typeReferenceToYardString(queryParam.valueType);
            optionTags.push(`@option params [${typeString}] :${paramName}`);
        }

        for (const headerParam of endpoint.headers) {
            const paramName = headerParam.name.name.snakeCase.safeName;
            const typeString = this.typeReferenceToYardString(headerParam.valueType);
            optionTags.push(`@option params [${typeString}] :${paramName}`);
        }

        if (optionTags.length > 0) {
            if (docParts.length > 0) {
                docParts.push("");
            }
            docParts.push(...optionTags);
        }

        return docParts.join("\n");
    }

    private typeReferenceToYardString(typeReference: TypeReference): string {
        switch (typeReference.type) {
            case "container":
                return this.containerTypeToYardString(typeReference.container);
            case "named": {
                const classRef = this.context.getReferenceToTypeId(typeReference.typeId);
                return `${classRef.modules.join("::")}::${classRef.name}`;
            }
            case "primitive":
                return this.primitiveTypeToYardString(typeReference.primitive);
            case "unknown":
                return "Hash{String => Object}";
            default:
                assertNever(typeReference);
        }
    }

    private containerTypeToYardString(container: ContainerType): string {
        switch (container.type) {
            case "list":
                return `Array<${this.typeReferenceToYardString(container.list)}>`;
            case "map":
                return `Hash{${this.typeReferenceToYardString(container.keyType)} => ${this.typeReferenceToYardString(container.valueType)}}`;
            case "set":
                return `Array<${this.typeReferenceToYardString(container.set)}>`;
            case "optional":
                return `${this.typeReferenceToYardString(container.optional)}, nil`;
            case "nullable":
                return `${this.typeReferenceToYardString(container.nullable)}, nil`;
            case "literal":
                return this.literalTypeToYardString(container.literal);
            default:
                assertNever(container);
        }
    }

    private primitiveTypeToYardString(primitive: PrimitiveType): string {
        switch (primitive.v1) {
            case "INTEGER":
            case "LONG":
            case "UINT":
            case "UINT_64":
                return "Integer";
            case "FLOAT":
            case "DOUBLE":
                return "Float";
            case "BOOLEAN":
                return "Boolean";
            case "STRING":
            case "DATE":
            case "DATE_TIME":
            case "UUID":
            case "BASE_64":
            case "BIG_INTEGER":
                return "String";
            default:
                return "Object";
        }
    }

    private literalTypeToYardString(literal: Literal): string {
        switch (literal.type) {
            case "boolean":
                return "Boolean";
            case "string":
                return "String";
            default:
                assertNever(literal);
        }
    }
}
