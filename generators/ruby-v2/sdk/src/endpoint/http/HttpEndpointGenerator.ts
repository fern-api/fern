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

        let requestStatements = this.generateRequestProcedure({ endpoint, sendRequestCodeBlock });

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
            docstring: endpoint.docs,
            returnType,
            parameters: {
                keyword: [
                    ruby.parameters.keyword({
                        name: "request_options",
                        initializer: ruby.TypeLiteral.hash([])
                    })
                ],
                keywordSplat: ruby.parameters.keywordSplat({
                    name: PARAMS_VN
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
}
