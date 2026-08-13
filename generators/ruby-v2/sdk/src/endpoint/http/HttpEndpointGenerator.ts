import { CaseConverter, getOriginalName, getWireValue } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FernIr } from "@fern-fern/ir-sdk";
import { DefaultValueExtractor } from "../../DefaultValueExtractor.js";
import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { getEndpointRequest } from "../utils/getEndpointRequest.js";
import { getEndpointReturnType } from "../utils/getEndpointReturnType.js";
import { RAW_CLIENT_REQUEST_VARIABLE_NAME, RawClient } from "./RawClient.js";

export declare namespace HttpEndpointGenerator {
    export interface GenerateArgs {
        endpoint: FernIr.HttpEndpoint;
        serviceId: FernIr.ServiceId;
    }
}

const QUERY_PARAMETER_BAG_NAME = "query_params";
const HEADER_PARAMETER_BAG_NAME = "headers";
export const HTTP_RESPONSE_VN = "response";
export const PARAMS_VN = "params";
export const CODE_VN = "code";
export const ERROR_CLASS_VN = "error_class";

export class HttpEndpointGenerator {
    private context: SdkGeneratorContext;
    private readonly case: CaseConverter;

    public constructor({ context }: { context: SdkGeneratorContext }) {
        this.context = context;
        this.case = context.caseConverter;
    }

    public generate({ endpoint, serviceId }: HttpEndpointGenerator.GenerateArgs): ruby.Method[] {
        return [this.generateUnpagedMethod({ endpoint, serviceId })];
    }

    private generateUnpagedMethod({
        endpoint,
        serviceId
    }: {
        endpoint: FernIr.HttpEndpoint;
        serviceId: FernIr.ServiceId;
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
        const queryParameterCodeBlock = request?.getQueryParameterCodeBlock(QUERY_PARAMETER_BAG_NAME);
        const headerParameterCodeBlock = request?.getHeaderParameterCodeBlock();
        const pathParameterReferences = this.getPathParameterReferences({ endpoint });

        // params is referenced whenever the request emits a body/query/header code
        // block (each reference produced by these blocks uses `params` either in a
        // standalone code statement or in the body reference string itself), or when
        // path parameters are extracted from params. Bytes-upload endpoints have a
        // requestBody but no `request` object (getEndpointRequest returns undefined
        // for them), so they correctly skip the params normalization.
        const paramsUsed =
            requestBodyCodeBlock != null ||
            queryParameterCodeBlock != null ||
            headerParameterCodeBlock != null ||
            Object.keys(pathParameterReferences).length > 0;

        if (paramsUsed) {
            statements.push(
                ruby.codeblock((writer) => {
                    writer.write(`${PARAMS_VN} = `);
                    ruby.invokeMethod({
                        on: ruby.classReference({
                            name: "Utils",
                            modules: [this.context.getRootModuleName(), "Internal", "Types"]
                        }),
                        method: "normalize_keys",
                        arguments_: [ruby.codeblock(PARAMS_VN)]
                    }).write(writer);
                })
            );
        }

        if (requestBodyCodeBlock?.code != null) {
            statements.push(requestBodyCodeBlock.code);
        }

        if (queryParameterCodeBlock?.code != null) {
            statements.push(queryParameterCodeBlock.code);
        }

        if (headerParameterCodeBlock?.code != null) {
            statements.push(headerParameterCodeBlock.code);
        }

        const requestType = request?.getRequestType();
        let headerBagReference = headerParameterCodeBlock?.headerParameterBagReference;
        const literalHeaders = this.getLiteralHeaders({ serviceId, endpoint });
        if (literalHeaders.length > 0) {
            if (headerBagReference == null) {
                statements.push(
                    ruby.codeblock(
                        `${HEADER_PARAMETER_BAG_NAME} = { ${literalHeaders
                            .map(({ wireValue, value }) => `${JSON.stringify(wireValue)} => ${JSON.stringify(value)}`)
                            .join(", ")} }`
                    )
                );
                headerBagReference = HEADER_PARAMETER_BAG_NAME;
            } else {
                for (const { wireValue, value } of literalHeaders) {
                    statements.push(
                        ruby.codeblock(
                            `${headerBagReference}[${JSON.stringify(wireValue)}] = ${JSON.stringify(value)} unless ${headerBagReference}.key?(${JSON.stringify(wireValue)})`
                        )
                    );
                }
            }
        }
        const idempotencyKey = this.getAutoGeneratedIdempotencyKey({ endpoint, requestType });
        if (idempotencyKey != null) {
            if (headerBagReference == null) {
                statements.push(
                    ruby.codeblock(
                        `${HEADER_PARAMETER_BAG_NAME} = { "${idempotencyKey.headerName}" => ${idempotencyKey.expression} }`
                    )
                );
                headerBagReference = HEADER_PARAMETER_BAG_NAME;
            } else {
                statements.push(
                    ruby.codeblock(
                        `${headerBagReference}["${idempotencyKey.headerName}"] = ${idempotencyKey.expression}`
                    )
                );
            }
        }

        // Under endpoint-security, route this endpoint's declared auth schemes into the
        // request headers. The routing provider (held by the RawClient) returns only the
        // headers for the schemes this endpoint requires; the flat client headers carry
        // no auth. Merge them under any explicit headers so caller/SDK headers win.
        if (this.context.isEndpointSecurity()) {
            const securityLiteral = this.getEndpointSecurityLiteral(endpoint);
            const authHeadersExpression = `@client.auth_headers_for_endpoint(security: ${securityLiteral})`;
            if (headerBagReference == null) {
                statements.push(ruby.codeblock(`${HEADER_PARAMETER_BAG_NAME} = ${authHeadersExpression}`));
                headerBagReference = HEADER_PARAMETER_BAG_NAME;
            } else {
                statements.push(
                    ruby.codeblock(`${headerBagReference} = ${authHeadersExpression}.merge(${headerBagReference})`)
                );
            }
        }

        const baseUrlName = this.getBaseUrlNameForEndpoint(endpoint);
        const sendRequestCodeBlock = rawClient.sendRequest({
            baseUrl: ruby.codeblock(""),
            pathParameterReferences,
            endpoint,
            requestType,
            queryBagReference: queryParameterCodeBlock?.queryParameterBagReference,
            headerBagReference,
            bodyReference: requestBodyCodeBlock?.requestBodyReference,
            omitContentTypeWithoutBody: requestBodyCodeBlock?.omitContentTypeWithoutBody,
            baseUrlName
        });

        const isCustomPagination = endpoint.pagination?.type === "custom";
        const isPaginated = endpoint.pagination != null;
        let requestStatements = this.generateRequestProcedure({
            endpoint,
            sendRequestCodeBlock,
            storeResponseInVariable: isCustomPagination,
            wrapWithHttpResponse: isPaginated && !isCustomPagination
        });

        const enhancedDocstring = this.generateEnhancedDocstring({ endpoint, request });
        const codeExample = this.getEndpointCodeExample({ endpoint });
        const splatOptionDocs = this.generateSplatOptionDocs({ endpoint });
        const requestOptionsDocs = this.generateRequestOptionsDocs();

        // Pagination blocks use string keys for query_params to match initialization
        // in WrappedEndpointRequest (e.g. query_params["page"], not query_params[:page])
        if (endpoint.pagination) {
            switch (endpoint.pagination.type) {
                case "custom": {
                    const customPagerClassName = this.context.customConfig.customPagerName ?? "CustomPager";
                    // Use snakeCase.safeName for Ruby method calls
                    const itemField = this.case.snakeSafe(endpoint.pagination.results.property.name);
                    requestStatements = [
                        ...requestStatements,
                        ruby.invokeMethod({
                            on: ruby.classReference({
                                name: customPagerClassName,
                                modules: [this.context.getRootModuleName(), "Internal"]
                            }),
                            method: "new",
                            arguments_: [ruby.codeblock("parsed_response")],
                            keywordArguments: [
                                ruby.keywordArgument({
                                    name: "item_field",
                                    value: ruby.codeblock(`:${itemField}`)
                                }),
                                ruby.keywordArgument({
                                    name: "raw_client",
                                    value: ruby.codeblock("@client")
                                }),
                                ruby.keywordArgument({
                                    name: "initial_http_response",
                                    value: ruby.codeblock(HTTP_RESPONSE_VN)
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
                                    // Use snakeCase.safeName for Ruby method calls (e.g., "next" -> "next_")
                                    value: ruby.codeblock(
                                        `:${this.case.snakeSafe(endpoint.pagination.next.property.name)}`
                                    )
                                }),
                                ruby.keywordArgument({
                                    name: "item_field",
                                    // Use snakeCase.safeName for Ruby method calls
                                    value: ruby.codeblock(
                                        `:${this.case.snakeSafe(endpoint.pagination.results.property.name)}`
                                    )
                                }),
                                ruby.keywordArgument({
                                    name: "initial_cursor",
                                    value: ruby.codeblock(
                                        `${QUERY_PARAMETER_BAG_NAME}["${getWireValue(endpoint.pagination.page.property.name)}"]`
                                    )
                                })
                            ],
                            block: [
                                ["next_cursor"],
                                [
                                    ruby.codeblock(
                                        `${QUERY_PARAMETER_BAG_NAME}["${getWireValue(endpoint.pagination.page.property.name)}"] = next_cursor`
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
                                        `${QUERY_PARAMETER_BAG_NAME}["${getWireValue(endpoint.pagination.page.property.name)}"]`
                                    )
                                }),
                                ruby.keywordArgument({
                                    name: "item_field",
                                    // Use snakeCase.safeName for Ruby method calls
                                    value: ruby.codeblock(
                                        `:${this.case.snakeSafe(endpoint.pagination.results.property.name)}`
                                    )
                                }),
                                ruby.keywordArgument({
                                    name: "has_next_field",
                                    // Use snakeCase.safeName for Ruby method calls
                                    value: endpoint.pagination.hasNextPage
                                        ? ruby.codeblock(
                                              `:${this.case.snakeSafe(endpoint.pagination.hasNextPage.property.name)}`
                                          )
                                        : ruby.nilValue()
                                }),
                                ruby.keywordArgument({
                                    name: "step",
                                    value:
                                        endpoint.pagination.step &&
                                        this.context.customConfig.offsetSemantics !== "page-index"
                                            ? ruby.trueValue()
                                            : ruby.falseValue()
                                })
                            ],
                            block: [
                                ["next_page"],
                                [
                                    ruby.codeblock(
                                        `${QUERY_PARAMETER_BAG_NAME}["${getWireValue(endpoint.pagination.page.property.name)}"] = next_page`
                                    ),
                                    ...requestStatements
                                ]
                            ]
                        })
                    ];
                    break;
                case "uri":
                case "path":
                    this.context.logger.warn(
                        `Pagination type "${endpoint.pagination.type}" is not supported by the Ruby SDK generator. Endpoint "${getOriginalName(endpoint.name)}" will be generated without pagination.`
                    );
                    break;
                default:
                    assertNever(endpoint.pagination);
            }
        }

        statements.push(...requestStatements);

        return ruby.method({
            name: this.case.snakeSafe(endpoint.name),
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
                    name: paramsUsed ? PARAMS_VN : `_${PARAMS_VN}`,
                    type: request?.getParameterType() ?? ruby.Type.hash(ruby.Type.untyped(), ruby.Type.untyped())
                })
            },
            splatOptionDocs: [...requestOptionsDocs, ...splatOptionDocs],
            codeExample,
            statements
        });
    }

    /**
     * When the IR enables idempotency-key auto-generation (`ir.sdkConfig.idempotencyKeyGeneration`
     * is present) and the endpoint's HTTP method is one of the configured methods, returns the
     * configured wire header name plus the Ruby expression to assign to it. For endpoints that
     * declare an idempotency header matching the configured wire name the caller-supplied value
     * wins and the generated UUID is only the fallback; otherwise a freshly generated UUID is used.
     * Returns undefined when no key should be injected.
     */
    private getAutoGeneratedIdempotencyKey({
        endpoint,
        requestType
    }: {
        endpoint: FernIr.HttpEndpoint;
        requestType: RawClient.RequestBodyType | undefined;
    }): { headerName: string; expression: string } | undefined {
        const idempotencyKeyGeneration = this.context.ir.sdkConfig.idempotencyKeyGeneration;
        if (idempotencyKeyGeneration == null) {
            return undefined;
        }
        if (!idempotencyKeyGeneration.methods.includes(endpoint.method)) {
            return undefined;
        }
        // Only the JSON and multipart request paths thread a header bag through to the
        // underlying request; other paths would leave the bag unused.
        if (requestType !== "json" && requestType !== "multipartform") {
            return undefined;
        }
        const headerName = idempotencyKeyGeneration.headerName;
        // If a declared endpoint header already carries the configured wire name it is
        // emitted by the header code block; avoid a duplicate entry.
        const hasEndpointIdempotencyKeyHeader = endpoint.headers.some(
            (header) => getWireValue(header.name).toLowerCase() === headerName.toLowerCase()
        );
        if (hasEndpointIdempotencyKeyHeader) {
            return undefined;
        }
        const declaresIdempotencyKey =
            endpoint.idempotent &&
            this.context.ir.idempotencyHeaders.some(
                (header) => getWireValue(header.name).toLowerCase() === headerName.toLowerCase()
            );
        // Generation of the key lives in a single core helper so the underlying
        // source of randomness is not repeated at every eligible endpoint.
        const generateExpression = `${this.context.getRootModuleName()}::Internal::IdempotencyKey.generate`;
        const expression = declaresIdempotencyKey
            ? `request_options[:idempotency_key] || ${generateExpression}`
            : generateExpression;
        return { headerName, expression };
    }

    private generateRequestProcedure({
        endpoint,
        sendRequestCodeBlock,
        storeResponseInVariable,
        wrapWithHttpResponse
    }: {
        endpoint: FernIr.HttpEndpoint;
        sendRequestCodeBlock?: ruby.CodeBlock;
        storeResponseInVariable?: boolean;
        wrapWithHttpResponse?: boolean;
    }): ruby.AstNode[] {
        const statements: ruby.AstNode[] = [];

        if (sendRequestCodeBlock != null) {
            statements.push(sendRequestCodeBlock);
        } else {
            statements.push(
                ruby.codeblock((writer) => {
                    writer.write(`request = ${PARAMS_VN}`);
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

        const jsonResponseBody =
            endpoint.response?.body != null &&
            endpoint.response.body.type === "json" &&
            endpoint.response.body.value.responseBodyType.type === "named"
                ? endpoint.response.body.value
                : undefined;

        const errorBody = ruby.codeblock((writer) => {
            const rootModuleName = this.context.getRootModuleName();
            writer.writeLine(
                `${ERROR_CLASS_VN} = ${rootModuleName}::Errors::ResponseError.subclass_for_code(${CODE_VN})`
            );

            ruby.raise({
                errorClass: ruby.codeblock(`${ERROR_CLASS_VN}.new(${HTTP_RESPONSE_VN}.body, code: ${CODE_VN})`)
            }).write(writer);
        });

        if (jsonResponseBody != null) {
            statements.push(
                ruby.ifElse({
                    if: {
                        condition: ruby.codeblock(`${CODE_VN}.between?(200, 299)`),
                        thenBody: [
                            ruby.codeblock((writer) => {
                                if (wrapWithHttpResponse) {
                                    if (jsonResponseBody.responseBodyType.type !== "named") {
                                        writer.writeLine(`parsed_response = nil`);
                                    }
                                    this.loadResponseBodyFromJson({
                                        writer,
                                        typeReference: jsonResponseBody.responseBodyType,
                                        storeInVariable: true
                                    });
                                    writer.writeLine(`[parsed_response, ${HTTP_RESPONSE_VN}]`);
                                } else {
                                    this.loadResponseBodyFromJson({
                                        writer,
                                        typeReference: jsonResponseBody.responseBodyType,
                                        storeInVariable: storeResponseInVariable
                                    });
                                }
                            })
                        ]
                    },
                    elseBody: errorBody
                })
            );
        } else if (wrapWithHttpResponse) {
            statements.push(
                ruby.ifElse({
                    if: {
                        condition: ruby.codeblock(`${CODE_VN}.between?(200, 299)`),
                        thenBody: [ruby.codeblock(`[nil, ${HTTP_RESPONSE_VN}]`)]
                    },
                    elseBody: errorBody
                })
            );
        } else {
            statements.push(ruby.codeblock(`return if ${CODE_VN}.between?(200, 299)\n`));
            statements.push(errorBody);
        }

        return statements;
    }

    /**
     * Returns the wire name and value of every service- and endpoint-level header whose
     * type is a literal. These headers have no caller-supplied value, so they must be
     * emitted directly into the request's header bag (callers can still override them
     * via request_options additional headers).
     */
    private getLiteralHeaders({
        serviceId,
        endpoint
    }: {
        serviceId: FernIr.ServiceId;
        endpoint: FernIr.HttpEndpoint;
    }): { wireValue: string; value: string }[] {
        const service = this.context.getHttpServiceOrThrow(serviceId);
        const literalHeaders: { wireValue: string; value: string }[] = [];
        for (const header of [...service.headers, ...endpoint.headers]) {
            const value = this.getLiteralHeaderValue(header.valueType);
            if (value != null) {
                literalHeaders.push({ wireValue: getWireValue(header.name), value });
            }
        }
        return literalHeaders;
    }

    private getLiteralHeaderValue(typeReference: FernIr.TypeReference): string | undefined {
        switch (typeReference.type) {
            case "container":
                switch (typeReference.container.type) {
                    case "literal":
                        return typeReference.container.literal.type === "string"
                            ? typeReference.container.literal.string
                            : String(typeReference.container.literal.boolean);
                    case "optional":
                        return this.getLiteralHeaderValue(typeReference.container.optional);
                    case "nullable":
                        return this.getLiteralHeaderValue(typeReference.container.nullable);
                    default:
                        return undefined;
                }
            case "named": {
                const typeDeclaration = this.context.getTypeDeclarationOrThrow(typeReference.typeId);
                if (typeDeclaration.shape.type === "alias") {
                    return this.getLiteralHeaderValue(typeDeclaration.shape.aliasOf);
                }
                return undefined;
            }
            default:
                return undefined;
        }
    }

    private getPathParameterReferences({ endpoint }: { endpoint: FernIr.HttpEndpoint }): Record<string, string> {
        const pathParameterReferences: Record<string, string> = {};
        const defaultExtractor = new DefaultValueExtractor(this.context);
        for (const pathParam of endpoint.allPathParameters) {
            const parameterName = this.getPathParameterName({
                pathParameter: pathParam
            });
            const clientDefault = defaultExtractor.extractClientDefault(pathParam.clientDefault);
            if (clientDefault != null) {
                pathParameterReferences[getOriginalName(pathParam.name)] =
                    `${PARAMS_VN}.fetch(:${parameterName}, ${clientDefault})`;
            } else {
                pathParameterReferences[getOriginalName(pathParam.name)] = `${PARAMS_VN}[:${parameterName}]`;
            }
        }
        return pathParameterReferences;
    }

    private getPathParameterName({ pathParameter }: { pathParameter: FernIr.PathParameter }): string {
        return this.case.snakeSafe(pathParameter.name);
    }

    private loadResponseBodyFromJson({
        writer,
        typeReference,
        storeInVariable
    }: {
        writer: ruby.Writer;
        typeReference: FernIr.TypeReference;
        storeInVariable?: boolean;
    }): void {
        switch (typeReference.type) {
            case "named": {
                const loadExpression = `${this.context.getReferenceToTypeId(typeReference.typeId)}.load(${HTTP_RESPONSE_VN}.body)`;
                if (storeInVariable) {
                    writer.writeLine(`parsed_response = ${loadExpression}`);
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
        endpoint: FernIr.HttpEndpoint;
        request: ReturnType<typeof getEndpointRequest>;
    }): string {
        return endpoint.docs ?? "";
    }

    private getEndpointCodeExample({ endpoint }: { endpoint: FernIr.HttpEndpoint }): string | undefined {
        const exampleCall = this.context.maybeGetExampleEndpointCall(endpoint);
        if (exampleCall == null) {
            return undefined;
        }
        return this.context.snippetGenerator.getSingleEndpointSnippet({
            endpoint,
            example: exampleCall
        })?.endpointCall;
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

    private generateSplatOptionDocs({ endpoint }: { endpoint: FernIr.HttpEndpoint }): string[] {
        const optionTags: string[] = [];

        for (const pathParam of endpoint.allPathParameters) {
            const paramName = this.case.snakeSafe(pathParam.name);
            const typeString = this.typeReferenceToYardString(pathParam.valueType);
            optionTags.push(`@option params [${typeString}] :${paramName}`);
        }

        for (const queryParam of endpoint.queryParameters) {
            const paramName = this.case.snakeSafe(queryParam.name);
            const typeString = this.typeReferenceToYardString(queryParam.valueType);
            optionTags.push(`@option params [${typeString}] :${paramName}`);
        }

        for (const headerParam of endpoint.headers) {
            const paramName = this.case.snakeSafe(headerParam.name);
            const typeString = this.typeReferenceToYardString(headerParam.valueType);
            optionTags.push(`@option params [${typeString}] :${paramName}`);
        }

        return optionTags;
    }

    private typeReferenceToYardString(typeReference: FernIr.TypeReference): string {
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

    /**
     * Renders the endpoint's static `security` requirement as a Ruby literal for
     * `auth_headers_for_endpoint(security:)`: an array of hashes mapping each scheme
     * key to its (possibly empty) list of scopes, e.g. `[{ "Bearer" => [] }]` or
     * `[{ "OAuth" => ["read-only"] }]`. Returns `nil` when the endpoint declares no
     * security (the routing method then applies no auth).
     */
    private getEndpointSecurityLiteral(endpoint: FernIr.HttpEndpoint): string {
        if (endpoint.security == null) {
            return "nil";
        }
        const requirements = endpoint.security.map((requirement) => {
            const entries = Object.entries(requirement).map(([schemeKey, scopes]) => {
                const scopesLiteral = `[${scopes.map((scope) => JSON.stringify(scope)).join(", ")}]`;
                return `${JSON.stringify(schemeKey)} => ${scopesLiteral}`;
            });
            return entries.length > 0 ? `{ ${entries.join(", ")} }` : "{}";
        });
        return `[${requirements.join(", ")}]`;
    }

    private getBaseUrlNameForEndpoint(endpoint: FernIr.HttpEndpoint): string | undefined {
        if (!this.context.isMultipleBaseUrlsEnvironment()) {
            return undefined;
        }

        const baseUrlId = endpoint.baseUrl ?? this.context.getDefaultBaseUrlId();
        if (baseUrlId == null) {
            return undefined;
        }

        return this.context.getBaseUrlName(baseUrlId);
    }
}
