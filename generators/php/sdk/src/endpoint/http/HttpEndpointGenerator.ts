import { Arguments, getOriginalName, NameInput, UnnamedArgument } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { php } from "@fern-api/php-codegen";
import { FernIr } from "@fern-fern/ir-sdk";
import { upperFirst } from "lodash-es";

import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { AbstractEndpointGenerator } from "../AbstractEndpointGenerator.js";
import { getEndpointReturnType } from "../utils/getEndpointReturnType.js";

type PagingEndpoint = FernIr.HttpEndpoint & { pagination: NonNullable<FernIr.HttpEndpoint["pagination"]> };

export declare namespace EndpointGenerator {
    export interface Args {
        /** the reference to the client */
        clientReference: string;
        /** the endpoint for the endpoint */
        endpoint: FernIr.HttpEndpoint;
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

    public generate({
        serviceId,
        service,
        endpoint
    }: {
        serviceId: FernIr.ServiceId;
        service: FernIr.HttpService;
        endpoint: FernIr.HttpEndpoint;
    }): php.Method[] {
        if (this.isUnsupportedPaginationType(endpoint)) {
            this.context.logger.warn(
                `Pagination type '${endpoint.pagination?.type}' is not supported for PHP, falling back to unpaged endpoint for ${getOriginalName(endpoint.name)}`
            );
        }
        const methods: php.Method[] = [];
        if (this.hasPagination(endpoint)) {
            methods.push(this.generatePagedEndpointMethod({ serviceId, service, endpoint }));
        }

        methods.push(this.generateUnpagedEndpointMethod({ serviceId, service, endpoint }));

        return methods;
    }

    public generateSignatures({
        serviceId,
        service,
        endpoint
    }: {
        serviceId: FernIr.ServiceId;
        service: FernIr.HttpService;
        endpoint: FernIr.HttpEndpoint;
    }): php.Method[] {
        const methods: php.Method[] = [];
        const endpointSignatureInfo = this.getEndpointSignatureInfo({ serviceId, service, endpoint });
        const parameters = [...endpointSignatureInfo.baseParameters];
        parameters.push(
            php.parameter({
                name: this.context.getRequestOptionsName(),
                type: php.Type.optional(this.context.getRequestOptionsType({ endpoint }))
            })
        );

        if (this.hasPagination(endpoint)) {
            const return_ = this.getPagerReturnType(endpoint);
            methods.push(
                php.method({
                    name: this.context.getPagedEndpointMethodName(endpoint),
                    access: "public",
                    parameters,
                    docs: endpoint.docs,
                    return_,
                    noBody: true
                })
            );
        } else {
            const return_ = getEndpointReturnType({ context: this.context, endpoint });
            methods.push(
                php.method({
                    name: this.context.getEndpointMethodName(endpoint),
                    access: "public",
                    parameters,
                    docs: endpoint.docs,
                    return_,
                    noBody: true
                })
            );
        }

        return methods;
    }

    public generateUnpagedEndpointMethod({
        serviceId,
        service,
        endpoint
    }: {
        serviceId: FernIr.ServiceId;
        service: FernIr.HttpService;
        endpoint: FernIr.HttpEndpoint;
    }): php.Method {
        const endpointSignatureInfo = this.getEndpointSignatureInfo({ serviceId, service, endpoint });
        const parameters = [...endpointSignatureInfo.baseParameters];
        parameters.push(
            php.parameter({
                name: this.context.getRequestOptionsName(),
                type: php.Type.optional(this.context.getRequestOptionsType({ endpoint }))
            })
        );
        const return_ = getEndpointReturnType({ context: this.context, endpoint });
        const hasPagination = this.hasPagination(endpoint);
        return php.method({
            name: hasPagination
                ? this.context.getUnpagedEndpointMethodName(endpoint)
                : this.context.getEndpointMethodName(endpoint),
            access: hasPagination ? "private" : "public",
            parameters,
            docs: endpoint.docs,
            return_,
            throws: [this.context.getBaseExceptionClassReference(), this.context.getBaseApiExceptionClassReference()],
            body: php.codeblock((writer) => {
                writer.writeNodeStatement(
                    php.assignVariable(
                        php.variable(this.context.getRequestOptionsName()),
                        php.mergeArrays(`$this->${this.context.getClientOptionsName()}`, {
                            ref: php.variable(this.context.getRequestOptionsName()),
                            fallback: "[]"
                        })
                    )
                );

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
                        requestTypeClassReference: classReference,
                        optionsArgument: php.variable(this.context.getRequestOptionsName())
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

    public generatePagedEndpointMethod({
        serviceId,
        service,
        endpoint
    }: {
        serviceId: FernIr.ServiceId;
        service: FernIr.HttpService;
        endpoint: FernIr.HttpEndpoint;
    }): php.Method {
        this.assertHasPagination(endpoint);
        const endpointSignatureInfo = this.getEndpointSignatureInfo({ serviceId, service, endpoint });
        const parameters = [...endpointSignatureInfo.baseParameters];
        const requestOptionsType = this.context.getRequestOptionsType({ endpoint });
        const optionsParamName = this.context.getRequestOptionsName();
        const optionsParamType = php.Type.optional(requestOptionsType);
        parameters.push(
            php.parameter({
                name: optionsParamName,
                type: optionsParamType
            })
        );
        const return_ = this.getPagerReturnType(endpoint);
        return php.method({
            name: this.context.getPagedEndpointMethodName(endpoint),
            access: "public",
            parameters,
            docs: endpoint.docs,
            return_,
            body: php.codeblock((writer) => {
                const requestParam = endpointSignatureInfo.requestParameter;
                if (!requestParam) {
                    throw new Error("Request parameter is required for pagination");
                }
                const unpagedEndpointMethodName = this.context.getUnpagedEndpointMethodName(endpoint);
                const unpagedEndpointResponseType = getEndpointReturnType({ context: this.context, endpoint });
                if (!unpagedEndpointResponseType) {
                    throw new Error("Internal error; a response type is required for pagination endpoints");
                }
                const requestParamVar = php.variable(requestParam.name);
                if (
                    requestParam.type.internalType.type === "optional" &&
                    requestParam.type.internalType.value.internalType.type === "reference"
                ) {
                    writer.write("if (");
                    writer.writeNode(requestParamVar);
                    writer.writeLine(" === null) {");
                    writer.indent();
                    writer.writeNodeStatement(
                        php.assignVariable(
                            requestParamVar,
                            this.context.createRequestWithDefaults(
                                requestParam.type.internalType.value.internalType.value
                            )
                        )
                    );
                    writer.dedent();
                    writer.writeLine("}");
                }

                switch (endpoint.pagination.type) {
                    case "offset":
                        this.generateOffsetMethodBody({
                            pagination: endpoint.pagination,
                            requestParam,
                            parameters,
                            unpagedEndpointResponseType,
                            writer,
                            unpagedEndpointMethodName
                        });
                        break;
                    case "cursor":
                        this.generateCursorMethodBody({
                            pagination: endpoint.pagination,
                            requestParam,
                            parameters,
                            unpagedEndpointResponseType,
                            writer,
                            unpagedEndpointMethodName
                        });
                        break;
                    case "custom":
                        this.generateCustomMethodBody({
                            pagination: endpoint.pagination,
                            parameters,
                            unpagedEndpointResponseType,
                            writer,
                            unpagedEndpointMethodName
                        });
                        break;
                    case "uri":
                    case "path":
                        this.context.logger.warn(
                            `Pagination type '${endpoint.pagination.type}' is not supported for PHP, skipping`
                        );
                        break;
                    default:
                        assertNever(endpoint.pagination);
                }
            })
        });
    }

    private generateCursorMethodBody({
        pagination,
        requestParam,
        parameters,
        unpagedEndpointResponseType,
        writer,
        unpagedEndpointMethodName
    }: {
        pagination: FernIr.CursorPagination;
        requestParam: php.Parameter;
        parameters: php.Parameter[];
        unpagedEndpointResponseType: php.Type;
        writer: php.Writer;
        unpagedEndpointMethodName: string;
    }) {
        const cursorPagerClassReference = this.context.getCursorPagerClassReference();
        const cursorType = this.context.phpTypeMapper.convert({ reference: pagination.next.property.valueType });
        writer.write("return ");
        writer.writeNodeStatement(
            php.instantiateClass({
                classReference: cursorPagerClassReference,
                arguments_: [
                    {
                        name: "request",
                        assignment: php.variable(requestParam.name)
                    },
                    {
                        name: "getNextPage",
                        assignment: php.codeblock((writer) => {
                            writer.write("fn(");
                            writer.writeNode(requestParam.type);
                            writer.write(" ");
                            writer.writeNode(php.variable(requestParam.name));
                            writer.write(") => ");
                            writer.writeNode(
                                php.invokeMethod({
                                    on: php.variable("this"),
                                    method: unpagedEndpointMethodName,
                                    arguments_: parameters.map((parameter) => php.variable(parameter.name))
                                })
                            );
                        })
                    },
                    {
                        name: "setCursor",
                        assignment: php.codeblock((writer) => {
                            writer.write("function (");
                            writer.writeNode(requestParam.type);
                            writer.write(" $request, ");
                            writer.writeNode(cursorType);
                            writer.writeLine(" $cursor) { ");
                            writer.indent();
                            writer.writeNodeStatement(
                                this.context.deepSetPagination(
                                    php.variable("request"),
                                    this.getFullPropertyPath(pagination.page),
                                    php.variable("cursor")
                                )
                            );
                            writer.dedent();
                            writer.write("}");
                        })
                    },
                    {
                        docs: "@phpstan-ignore-next-line",
                        name: "getNextCursor",
                        assignment: php.codeblock((writer) => {
                            writer.write("fn (");
                            writer.writeNode(unpagedEndpointResponseType);
                            writer.write(" $response) => ");
                            writer.writeNode(this.nullableGet("$response", pagination.next));
                            writer.write(" ?? null");
                        })
                    },
                    {
                        docs: "@phpstan-ignore-next-line",
                        name: "getItems",
                        assignment: php.codeblock((writer) => {
                            writer.write("fn (");
                            writer.writeNode(unpagedEndpointResponseType);
                            writer.write(" $response) => ");
                            writer.writeNode(this.nullableGet("$response", pagination.results));
                            writer.write(" ?? []");
                        })
                    }
                ],
                multiline: true
            })
        );
    }

    private generateOffsetMethodBody({
        pagination,
        requestParam,
        parameters,
        unpagedEndpointResponseType,
        writer,
        unpagedEndpointMethodName
    }: {
        pagination: FernIr.OffsetPagination;
        requestParam: php.Parameter;
        parameters: php.Parameter[];
        unpagedEndpointResponseType: php.Type;
        writer: php.Writer;
        unpagedEndpointMethodName: string;
    }) {
        const offsetPagerClassReference = this.context.getOffsetPagerClassReference();
        writer.write("return ");
        writer.writeNodeStatement(
            php.instantiateClass({
                classReference: offsetPagerClassReference,
                arguments_: [
                    {
                        name: "request",
                        assignment: php.variable(requestParam.name)
                    },
                    {
                        name: "getNextPage",
                        assignment: php.codeblock((writer) => {
                            writer.write("fn(");
                            writer.writeNode(requestParam.type);
                            writer.write(" ");
                            writer.writeNode(php.variable(requestParam.name));
                            writer.write(") => ");
                            writer.writeNode(
                                php.invokeMethod({
                                    on: php.variable("this"),
                                    method: unpagedEndpointMethodName,
                                    arguments_: parameters.map((parameter) => php.variable(parameter.name))
                                })
                            );
                        })
                    },
                    {
                        docs: "@phpstan-ignore-next-line",
                        name: "getOffset",
                        assignment: php.codeblock((writer) => {
                            writer.write("fn(");
                            writer.writeNode(requestParam.type);
                            writer.write(" $request) => ");
                            writer.writeNode(this.nullableGet("$request", pagination.page));
                            writer.write(" ?? 0");
                        })
                    },
                    {
                        name: "setOffset",
                        assignment: php.codeblock((writer) => {
                            writer.write("function (");
                            writer.writeNode(requestParam.type);
                            writer.writeLine(" $request, int $offset) { ");
                            writer.indent();
                            writer.writeNodeStatement(
                                this.context.deepSetPagination(
                                    php.variable("request"),
                                    this.getFullPropertyPath(pagination.page),
                                    php.variable("offset")
                                )
                            );
                            writer.dedent();
                            writer.write("}");
                        })
                    },
                    {
                        docs: pagination.step ? "@phpstan-ignore-next-line" : undefined,
                        name: "getStep",
                        assignment: php.codeblock((writer) => {
                            if (!pagination.step) {
                                writer.write("null");
                                return;
                            }
                            writer.write("fn(");
                            writer.writeNode(requestParam.type);
                            writer.write(" $request) => ");
                            writer.writeNode(this.nullableGet("$request", pagination.step));
                            writer.write(" ?? 0");
                        })
                    },
                    {
                        docs: "@phpstan-ignore-next-line",
                        name: "getItems",
                        assignment: php.codeblock((writer) => {
                            writer.write("fn(");
                            writer.writeNode(unpagedEndpointResponseType);
                            writer.write(" $response) => ");
                            writer.writeNode(this.nullableGet("$response", pagination.results));
                            writer.write(" ?? []");
                        })
                    },
                    {
                        docs: "@phpstan-ignore-next-line",
                        name: "hasNextPage",
                        assignment: php.codeblock((writer) => {
                            if (!pagination.hasNextPage) {
                                writer.write("null");
                                return;
                            }
                            writer.write("fn(");
                            writer.writeNode(unpagedEndpointResponseType);
                            writer.write(" $response) => ");
                            writer.writeNode(this.nullableGet("$response", pagination.hasNextPage));
                        })
                    }
                ],
                multiline: true
            })
        );
    }

    private generateCustomMethodBody({
        pagination,
        parameters,
        unpagedEndpointResponseType,
        writer,
        unpagedEndpointMethodName
    }: {
        pagination: FernIr.CustomPagination;
        parameters: php.Parameter[];
        unpagedEndpointResponseType: php.Type;
        writer: php.Writer;
        unpagedEndpointMethodName: string;
    }) {
        const customPagerClassReference = this.context.getCustomPagerClassReference();

        // First, call the unpaged endpoint to get the initial response
        writer.write("$response = ");
        writer.writeNodeStatement(
            php.invokeMethod({
                on: php.variable("this"),
                method: unpagedEndpointMethodName,
                arguments_: parameters.map((parameter) => php.variable(parameter.name))
            })
        );

        // Return a new CustomPager with the response and client
        writer.write("return ");
        writer.writeNodeStatement(
            php.instantiateClass({
                classReference: customPagerClassReference,
                arguments_: [
                    {
                        name: "response",
                        assignment: php.variable("response")
                    },
                    {
                        name: "client",
                        assignment: php.variable("this")
                    }
                ],
                multiline: false
            })
        );
    }

    private getFullPropertyPath(property: FernIr.RequestProperty | FernIr.ResponseProperty): NameInput[] {
        return [...(property.propertyPath?.map((elem) => elem.name) ?? []), property.property.name];
    }

    private nullableGet(
        variableName: string,
        { property, propertyPath }: FernIr.RequestProperty | FernIr.ResponseProperty
    ): php.AstNode {
        return php.codeblock((writer) => {
            writer.writeNode(php.variable(variableName));
            if (propertyPath) {
                for (const propertyPathElement of propertyPath) {
                    writer.write("?");
                    writer.writeNode(this.context.getTypeGetter(propertyPathElement.name));
                }
            }
            writer.write("?");
            writer.writeNode(this.context.getTypeGetter(property.name));
        });
    }

    protected getPagerReturnType(endpoint: FernIr.HttpEndpoint): php.Type {
        const itemType = this.getPaginationItemType(endpoint);
        const pager = this.context.getPagerClassReference(itemType);
        return php.Type.reference(pager);
    }

    protected getPaginationItemType(endpoint: FernIr.HttpEndpoint): php.Type {
        this.assertHasPagination(endpoint);
        const listItemType = this.context.phpTypeMapper.convert({
            reference: (() => {
                switch (endpoint.pagination.type) {
                    case "offset":
                        return endpoint.pagination.results.property.valueType;
                    case "cursor":
                        return endpoint.pagination.results.property.valueType;
                    case "custom":
                        return endpoint.pagination.results.property.valueType;
                    case "uri":
                    case "path":
                        // unreachable: hasPagination() returns false for uri/path
                        throw new Error(`Pagination type ${endpoint.pagination.type} is not supported`);
                    default:
                        assertNever(endpoint.pagination);
                }
            })()
        });

        if (listItemType.internalType.type === "optional") {
            if (listItemType.internalType.value.internalType.type === "array") {
                return listItemType.internalType.value.internalType.value;
            }

            throw new Error(
                `Pagination result type for endpoint ${getOriginalName(endpoint.name)} must be an array, but is an optional ${listItemType.internalType.value.internalType.type}.`
            );
        }

        if (listItemType.internalType.type === "array") {
            return listItemType.internalType.value;
        }

        throw new Error(
            `Pagination result type for endpoint ${getOriginalName(endpoint.name)} must be an array, but is ${listItemType.internalType.type}.`
        );
    }

    protected hasPagination(endpoint: FernIr.HttpEndpoint): endpoint is PagingEndpoint {
        if (!this.context.config.generatePaginatedClients) {
            return false;
        }
        if (endpoint.pagination == null) {
            return false;
        }
        if (this.isUnsupportedPaginationType(endpoint)) {
            return false;
        }
        return true;
    }

    private isUnsupportedPaginationType(endpoint: FernIr.HttpEndpoint): boolean {
        return (
            endpoint.pagination != null && (endpoint.pagination.type === "uri" || endpoint.pagination.type === "path")
        );
    }

    protected assertHasPagination(endpoint: FernIr.HttpEndpoint): asserts endpoint is PagingEndpoint {
        if (this.hasPagination(endpoint)) {
            return;
        }
        throw new Error(`Endpoint ${getOriginalName(endpoint.name)} is not a paginated endpoint`);
    }

    private getRequestTypeClassReference(requestBody: FernIr.HttpRequestBody): php.ClassReference {
        return requestBody._visit({
            inlinedRequestBody: () => this.context.getJsonApiRequestClassReference(),
            reference: () => this.context.getJsonApiRequestClassReference(),
            fileUpload: () => this.context.getMultipartApiRequestClassReference(),
            bytes: () => this.context.getJsonApiRequestClassReference(), // TODO: Add support for BytesApiRequest
            _other: () => this.context.getJsonApiRequestClassReference()
        });
    }

    private getBaseURLForEndpoint({ endpoint }: { endpoint: FernIr.HttpEndpoint }): php.CodeBlock {
        return php.codeblock((writer) => {
            const isMultiUrl = this.context.ir.environments?.environments.type === "multipleBaseUrls";
            const hasEndpointBaseUrl = endpoint.baseUrl != null;

            if (isMultiUrl && hasEndpointBaseUrl && endpoint.baseUrl != null) {
                const baseUrlPropertyName = this.context.getBaseUrlPropertyName(endpoint.baseUrl);
                writer.write(`$this->environment->${baseUrlPropertyName}`);
            } else {
                const rawClientFieldName = this.context.rawClient.getFieldName();
                const clientOptionsName = this.context.getClientOptionsName();
                const requestOptionName = this.context.getRequestOptionsName();
                const baseUrlOptionName = this.context.getBaseUrlOptionName();
                const defaultBaseUrl = this.context.getDefaultBaseUrlForEndpoint(endpoint);

                writer.write(
                    `$${requestOptionName}['${baseUrlOptionName}'] ?? $this->${rawClientFieldName}->${clientOptionsName}['${baseUrlOptionName}'] ?? `
                );
                writer.writeNode(defaultBaseUrl);
            }
        });
    }

    private getEndpointErrorHandling({ endpoint }: { endpoint: FernIr.HttpEndpoint }): php.CodeBlock {
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
        endpoint: FernIr.HttpEndpoint;
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
                bytes: () => {
                    writer.controlFlow(
                        "if",
                        php.codeblock(`${STATUS_CODE_VARIABLE_NAME} >= 200 && ${STATUS_CODE_VARIABLE_NAME} < 400`)
                    );
                    writer.writeTextStatement(`return ${RESPONSE_VARIABLE_NAME}->getBody()->getContents()`);
                    writer.endControlFlow();
                },
                streamParameter: () => this.context.logger.error("Stream parameters not supported"),
                fileDownload: () => {
                    writer.controlFlow(
                        "if",
                        php.codeblock(`${STATUS_CODE_VARIABLE_NAME} >= 200 && ${STATUS_CODE_VARIABLE_NAME} < 400`)
                    );
                    writer.writeTextStatement(`return ${RESPONSE_VARIABLE_NAME}->getBody()->getContents()`);
                    writer.endControlFlow();
                },
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
                    writer.controlFlow("if", php.codeblock(`empty(${JSON_VARIABLE_NAME})`));
                    writer.writeTextStatement("return null");
                    writer.endControlFlow();
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
            case "literal":
                return this.decodeJsonResponseForPrimitive({
                    arguments_,
                    methodSuffix: upperFirst(internalType.type)
                });
            case "enumString":
                return this.decodeJsonResponseForEnumString({
                    arguments_
                });
            case "union":
                return this.decodeJsonResponseForUnion({
                    arguments_,
                    types: internalType.types
                });
            case "object":
            case "optional":
            case "null":
            case "typeDict":
                throw new Error(`Internal error; '${internalType.type}' type is not a supported return type`);
            default:
                assertNever(internalType);
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

    private decodeJsonResponseForEnumString({ arguments_ }: { arguments_: Arguments }): php.CodeBlock {
        return php.codeblock((writer) => {
            writer.writeNode(
                php.invokeMethod({
                    on: this.context.getJsonDecoderClassReference(),
                    method: "decodeString",
                    arguments_,
                    static_: true
                })
            );
            writer.writeLine("; // @phpstan-ignore-line");
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
