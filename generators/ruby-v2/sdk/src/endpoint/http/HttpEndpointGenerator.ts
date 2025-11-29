import { assertNever } from "@fern-api/core-utils";
import { ruby } from "@fern-api/ruby-ast";
import { HttpEndpoint, PathParameter, ServiceId, TypeReference } from "@fern-fern/ir-sdk/api";
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

        const isCustomPagination = endpoint.pagination?.type === "custom";
        let requestStatements = this.generateRequestProcedure({
            endpoint,
            sendRequestCodeBlock,
            storeResponseInVariable: isCustomPagination
        });

        const enhancedDocstring = this.generateEnhancedDocstring({ endpoint, request });
        const splatOptionDocs = this.generateSplatOptionDocs({ endpoint });
        const requestOptionsDocs = this.generateRequestOptionsDocs();

        if (endpoint.pagination) {
            switch (endpoint.pagination.type) {
                case "custom": {
                    const customPagerClassName = this.context.customConfig.customPagerName ?? "CustomPager";
                    const itemField = endpoint.pagination.results.property.name.wireValue;
                    requestStatements = [
                        ...requestStatements,
                        ruby.invokeMethod({
                            on: ruby.classReference({
                                name: customPagerClassName,
                                modules: [this.context.getRootModuleName(), "Internal"]
                            }),
                            method: "new",
                            arguments_: [ruby.codeblock("_parsed_response")],
                            keywordArguments: [
                                ruby.keywordArgument({
                                    name: "item_field",
                                    value: ruby.codeblock(`:${itemField}`)
                                }),
                                ruby.keywordArgument({
                                    name: "raw_client",
                                    value: ruby.codeblock("@client")
                                })
                            ]
                        })
                    ];
                    break;
                }
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
                        type: ruby.Type.class_({ name: "Hash" }),
                        initializer: ruby.TypeLiteral.hash([])
                    })
                ],
                keywordSplat: ruby.parameters.keywordSplat({
                    name: PARAMS_VN,
                    type: request?.getParameterType() ?? ruby.Type.hash(ruby.Type.untyped(), ruby.Type.untyped())
                })
            },
            splatOptionDocs: [...requestOptionsDocs, ...splatOptionDocs],
            statements
        });
    }

    private generateRequestProcedure({
        endpoint,
        sendRequestCodeBlock,
        storeResponseInVariable
    }: {
        endpoint: HttpEndpoint;
        sendRequestCodeBlock?: ruby.CodeBlock;
        storeResponseInVariable?: boolean;
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
                                            typeReference: endpoint.response.body.value.responseBodyType,
                                            storeInVariable: storeResponseInVariable
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
        typeReference,
        storeInVariable
    }: {
        writer: ruby.Writer;
        typeReference: TypeReference;
        storeInVariable?: boolean;
    }): void {
        switch (typeReference.type) {
            case "named": {
                const loadExpression = `${this.context.getReferenceToTypeId(typeReference.typeId)}.load(${HTTP_RESPONSE_VN}.body)`;
                if (storeInVariable) {
                    writer.writeLine(`_parsed_response = ${loadExpression}`);
                } else {
                    writer.writeLine(loadExpression);
                }
                break;
            }
            default:
                break;
        }
    }

    private generateEnhancedDocstring({
        endpoint
    }: {
        endpoint: HttpEndpoint;
        request: ReturnType<typeof getEndpointRequest>;
    }): string {
        return endpoint.docs ?? "";
    }

    private generateRequestOptionsDocs(): string[] {
        const optionTags: string[] = [];
        optionTags.push("@option request_options [String] :base_url");
        optionTags.push("@option request_options [Hash{String => Object}] :additional_headers");
        optionTags.push("@option request_options [Hash{String => Object}] :additional_query_parameters");
        optionTags.push("@option request_options [Hash{String => Object}] :additional_body_parameters");
        optionTags.push("@option request_options [Integer] :timeout_in_seconds");
        return optionTags;
    }

    private generateSplatOptionDocs({ endpoint }: { endpoint: HttpEndpoint }): string[] {
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

        return optionTags;
    }

    private typeReferenceToYardString(typeReference: TypeReference): string {
        if (typeReference.type === "named") {
            const classRef = this.context.getClassReferenceForTypeId(typeReference.typeId);
            const modules = classRef.modules.length > 0 ? `${classRef.modules.join("::")}::` : "";
            return `${modules}${classRef.name}`;
        }

        const rubyType = this.context.typeMapper.convert({ reference: typeReference });
        const writer = new ruby.Writer({ customConfig: this.context.customConfig });
        rubyType.writeTypeDefinition(writer);
        return this.normalizeForYard(writer.toString());
    }

    private normalizeForYard(typeString: string): string {
        let normalized = typeString.replace(/\s*\|\s*/g, ", ");
        normalized = normalized.replace(/\bbool\b/g, "Boolean");
        normalized = normalized.replace(/(^|,\s*)nil(?:,\s*nil)+(?=,|\]|$)/g, "$1nil");
        normalized = normalized.replace(/Hash\[untyped,\s*untyped\]/g, "Hash");
        return normalized;
    }
}
