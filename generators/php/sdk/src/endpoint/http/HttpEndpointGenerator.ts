import {
    Arguments,
    GeneratorError,
    getOriginalName,
    getWireValue,
    NameInput,
    UnnamedArgument
} from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { php } from "@fern-api/php-codegen";
import { FernIr } from "@fern-fern/ir-sdk";
import { upperFirst } from "lodash-es";

import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { AbstractEndpointGenerator } from "../AbstractEndpointGenerator.js";
import { getEndpointReturnType } from "../utils/getEndpointReturnType.js";
import { mayOmitRequestBody } from "../utils/mayOmitRequestBody.js";
import { getRetriesDisabledStatement } from "../utils/retriesDisabled.js";

type PagingEndpoint = FernIr.HttpEndpoint & { pagination: NonNullable<FernIr.HttpEndpoint["pagination"]> };

interface DecodedJsonResponse {
    /** The statement that assigns or returns the deserialized body. */
    code: php.CodeBlock;
    /** Whether that statement already suppresses a type mismatch phpstan would report. */
    carriesPhpstanIgnore: boolean;
}

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
const HEADER_BAG_NAME = "$headers";
// Not `$body`: a multipart or file-upload endpoint already has a local `$body` for the
// request body it is sending.
const BODY_VARIABLE_NAME = "$responseBody";
const HTTP_RESPONSE_FACTORY_METHOD_NAME = "from";

export class HttpEndpointGenerator extends AbstractEndpointGenerator {
    public constructor({ context }: { context: SdkGeneratorContext }) {
        super({ context });
    }

    public generate({
        serviceId,
        service,
        endpoint,
        raw = false
    }: {
        serviceId: FernIr.ServiceId;
        service: FernIr.HttpService;
        endpoint: FernIr.HttpEndpoint;
        /** Emit the raw client's variant of this endpoint, returning `HttpResponse<T>`. */
        raw?: boolean;
    }): php.Method[] {
        // A raw client has one method per endpoint, whatever the endpoint's pagination: a pager
        // hands out pages, not responses, so there is nothing for it to wrap. The unpaged call
        // underneath is exactly the one that has a response, and it keeps the endpoint's own name.
        if (raw) {
            return [this.generateUnpagedEndpointMethod({ serviceId, service, endpoint, raw: true })];
        }
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
                    codeExample: this.getEndpointCodeExample(endpoint),
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
                    codeExample: this.getEndpointCodeExample(endpoint),
                    return_,
                    noBody: true
                })
            );
        }

        return methods;
    }

    private getEndpointCodeExample(endpoint: FernIr.HttpEndpoint): string | undefined {
        const snippets = this.context.snippetGenerator.getSnippetsForEndpoint(endpoint.id);
        const snippet = snippets?.userSpecified[0] ?? snippets?.autogenerated[0];
        return snippet?.endpointCall;
    }

    public generateUnpagedEndpointMethod({
        serviceId,
        service,
        endpoint,
        raw = false
    }: {
        serviceId: FernIr.ServiceId;
        service: FernIr.HttpService;
        endpoint: FernIr.HttpEndpoint;
        raw?: boolean;
    }): php.Method {
        const endpointSignatureInfo = this.getEndpointSignatureInfo({ serviceId, service, endpoint });
        const parameters = [...endpointSignatureInfo.baseParameters];
        parameters.push(
            php.parameter({
                name: this.context.getRequestOptionsName(),
                type: php.Type.optional(this.context.getRequestOptionsType({ endpoint }))
            })
        );
        const bodyType = getEndpointReturnType({ context: this.context, endpoint });
        // The raw variant returns the same value the plain one does, wrapped. An endpoint with no
        // response body still has headers, so it wraps `null` rather than returning nothing.
        const return_ = raw
            ? php.Type.reference(this.context.getHttpResponseClassReference(bodyType ?? php.Type.null()))
            : bodyType;
        const hasPagination = !raw && this.hasPagination(endpoint);
        return php.method({
            name: hasPagination
                ? this.context.getUnpagedEndpointMethodName(endpoint)
                : this.context.getEndpointMethodName(endpoint),
            access: hasPagination ? "private" : "public",
            parameters,
            docs: endpoint.docs,
            codeExample: hasPagination || raw ? undefined : this.getEndpointCodeExample(endpoint),
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

                this.writeRetriesDisabledOverride({ writer, endpoint });

                this.writeEndpointAuthHeaders({ writer, endpoint });

                const queryParameterCodeBlock = endpointSignatureInfo.request?.getQueryParameterCodeBlock();
                if (queryParameterCodeBlock != null) {
                    queryParameterCodeBlock.code.write(writer);
                }
                const headerParameterCodeBlock = endpointSignatureInfo.request?.getHeaderParameterCodeBlock();
                if (headerParameterCodeBlock != null) {
                    headerParameterCodeBlock.code.write(writer);
                }
                const idempotencyKeyCodeBlock = this.getIdempotencyKeyCodeBlock({
                    endpoint,
                    existingHeaderBagReference: headerParameterCodeBlock?.headerParameterBagReference
                });
                if (idempotencyKeyCodeBlock != null) {
                    idempotencyKeyCodeBlock.code.write(writer);
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
                        headerBagReference:
                            idempotencyKeyCodeBlock?.headerBagReference ??
                            headerParameterCodeBlock?.headerParameterBagReference,
                        queryBagReference: queryParameterCodeBlock?.queryParameterBagReference,
                        requestTypeClassReference: classReference,
                        omitContentTypeWithoutBody: mayOmitRequestBody({ context: this.context, endpoint }),
                        optionsArgument: php.variable(this.context.getRequestOptionsName())
                    })
                );
                writer.writeTextStatement(`${STATUS_CODE_VARIABLE_NAME} = ${RESPONSE_VARIABLE_NAME}->getStatusCode()`);
                const successResponseStatements = this.getEndpointSuccessResponseStatements({
                    endpoint,
                    return_: bodyType,
                    raw
                });
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

    private writeRetriesDisabledOverride({
        writer,
        endpoint
    }: {
        writer: php.Writer;
        endpoint: FernIr.HttpEndpoint;
    }): void {
        const statement = getRetriesDisabledStatement({ context: this.context, endpoint });
        if (statement == null) {
            return;
        }
        writer.writeTextStatement(statement);
    }

    /**
     * Under ENDPOINT_SECURITY, computes this endpoint's routed auth headers from the shared
     * RoutingAuthProvider and merges them into the request options so only the schemes this
     * endpoint declares are applied. Emits nothing for other auth requirements (auth is
     * applied flatly there) or for endpoints that declare no security requirements.
     */
    private writeEndpointAuthHeaders({
        writer,
        endpoint
    }: {
        writer: php.Writer;
        endpoint: FernIr.HttpEndpoint;
    }): void {
        if (!this.context.isEndpointSecurity()) {
            return;
        }
        const security = endpoint.security;
        if (security == null || security.length === 0) {
            return;
        }
        const optionsName = this.context.getRequestOptionsName();
        const headersOption = this.context.getHeadersOptionName();
        writer.write(`$${optionsName}['${headersOption}'] = array_merge(`);
        // Null-safe: the token providers' internal auth client has no routing provider, but
        // its (unauthenticated) endpoints never declare security so this path is not reached
        // for them. `?? []` keeps PHPStan happy for the nullable subclient field.
        writer.writeLine(
            `$this->routingAuthProvider?->getAuthHeaders(${this.getEndpointSecurityLiteral(security)}) ?? [], `
        );
        writer.writeTextStatement(`$${optionsName}['${headersOption}'] ?? [])`);
    }

    /**
     * Renders an endpoint's static security requirements as a PHP array literal:
     * an OR-list of AND-maps of scheme key to its (unused-at-runtime) scopes.
     */
    private getEndpointSecurityLiteral(security: Record<string, string[]>[]): string {
        const requirements = security.map((requirement) => {
            const entries = Object.entries(requirement).map(([schemeKey, scopes]) => {
                const scopeLiteral = scopes.map((scope) => `'${scope.replace(/'/g, "\\'")}'`).join(", ");
                return `'${schemeKey}' => [${scopeLiteral}]`;
            });
            return `[${entries.join(", ")}]`;
        });
        return `[${requirements.join(", ")}]`;
    }

    /**
     * When the IR enables idempotency-key generation, requests whose method is one of the
     * IR-configured eligible methods attach the configured idempotency header whose value is a
     * freshly generated UUIDv4. If the endpoint already declares that header as an idempotency
     * header, a caller-supplied value wins and the generated UUID is only the fallback. The set
     * of eligible methods and the header name come from the IR (`sdkConfig.idempotencyKeyGeneration`)
     * so behavior is identical across generators instead of being hard-coded here.
     */
    private getIdempotencyKeyCodeBlock({
        endpoint,
        existingHeaderBagReference
    }: {
        endpoint: FernIr.HttpEndpoint;
        existingHeaderBagReference: string | undefined;
    }): { code: php.CodeBlock; headerBagReference: string } | undefined {
        const idempotencyKeyGeneration = this.context.ir.sdkConfig.idempotencyKeyGeneration;
        if (idempotencyKeyGeneration == null) {
            return undefined;
        }
        if (!idempotencyKeyGeneration.methods.includes(endpoint.method)) {
            return undefined;
        }
        const headerName = idempotencyKeyGeneration.headerName;
        const declaredIdempotencyHeader = endpoint.idempotent
            ? this.context.ir.idempotencyHeaders.find(
                  (header) => getWireValue(header.name).toLowerCase() === headerName.toLowerCase()
              )
            : undefined;
        // Reuse the existing header bag when the endpoint already writes header params so declared
        // header params are never dropped; otherwise declare a fresh bag.
        const headerBagReference = existingHeaderBagReference ?? HEADER_BAG_NAME;
        // Emit and look up using the declared wire name (when present) so casing stays consistent
        // with the case-insensitive match above.
        const headerKey = declaredIdempotencyHeader != null ? getWireValue(declaredIdempotencyHeader.name) : headerName;
        const generateCall = php.invokeMethod({
            on: this.context.getCoreClientClassReference("IdempotencyKey"),
            method: "generate",
            arguments_: [],
            static_: true
        });
        return {
            headerBagReference,
            code: php.codeblock((writer) => {
                if (existingHeaderBagReference == null) {
                    writer.writeTextStatement(`${headerBagReference} = []`);
                }
                writer.write(`${headerBagReference}['${headerKey}'] = `);
                if (declaredIdempotencyHeader != null) {
                    writer.write(`$${this.context.getRequestOptionsName()}['headers']['${headerKey}'] ?? `);
                }
                writer.writeNodeStatement(generateCall);
            })
        };
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
            codeExample: this.getEndpointCodeExample(endpoint),
            return_,
            body: php.codeblock((writer) => {
                const requestParam = endpointSignatureInfo.requestParameter;
                if (!requestParam) {
                    throw GeneratorError.validationError("Request parameter is required for pagination");
                }
                const unpagedEndpointMethodName = this.context.getUnpagedEndpointMethodName(endpoint);
                const unpagedEndpointResponseType = getEndpointReturnType({ context: this.context, endpoint });
                if (!unpagedEndpointResponseType) {
                    throw GeneratorError.internalError(
                        "Internal error; a response type is required for pagination endpoints"
                    );
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
        const usePageIndexSemantics = this.context.customConfig.offsetSemantics === "page-index";
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
                        docs: pagination.step && !usePageIndexSemantics ? "@phpstan-ignore-next-line" : undefined,
                        name: "getStep",
                        assignment: php.codeblock((writer) => {
                            if (!pagination.step || usePageIndexSemantics) {
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
                        throw GeneratorError.validationError(
                            `Pagination type ${endpoint.pagination.type} is not supported`
                        );
                    default:
                        assertNever(endpoint.pagination);
                }
            })()
        });

        if (listItemType.internalType.type === "optional") {
            if (listItemType.internalType.value.internalType.type === "array") {
                return listItemType.internalType.value.internalType.value;
            }

            throw GeneratorError.internalError(
                `Pagination result type for endpoint ${getOriginalName(endpoint.name)} must be an array, but is an optional ${listItemType.internalType.value.internalType.type}.`
            );
        }

        if (listItemType.internalType.type === "array") {
            return listItemType.internalType.value;
        }

        throw GeneratorError.internalError(
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
        throw GeneratorError.internalError(`Endpoint ${getOriginalName(endpoint.name)} is not a paginated endpoint`);
    }

    private getRequestTypeClassReference(requestBody: FernIr.HttpRequestBody): php.ClassReference {
        return requestBody._visit({
            inlinedRequestBody: (inlinedRequestBody) =>
                inlinedRequestBody.contentType === "application/x-www-form-urlencoded"
                    ? this.context.getUrlEncodedApiRequestClassReference()
                    : this.context.getJsonApiRequestClassReference(),
            reference: (reference) =>
                reference.contentType === "application/x-www-form-urlencoded"
                    ? this.context.getUrlEncodedApiRequestClassReference()
                    : this.context.getJsonApiRequestClassReference(),
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

    /**
     * Writes the success return of an endpoint method.
     *
     * `value` is what the plain client returns; `undefined` is its bodyless `return;`. A raw
     * client returns the same value wrapped together with the response it came from, so that
     * the status and the headers an endpoint method otherwise reads and discards survive.
     */
    private writeSuccessReturn({
        writer,
        raw,
        value,
        phpstanIgnore = false
    }: {
        writer: php.Writer;
        raw: boolean;
        value?: php.AstNode;
        /** Suppress the raw return's type mismatch, where the plain return already suppresses it. */
        phpstanIgnore?: boolean;
    }): void {
        if (!raw) {
            if (value == null) {
                writer.writeLine("return;");
                return;
            }
            writer.write("return ");
            writer.writeNodeStatement(value);
            return;
        }
        writer.write("return ");
        writer.writeNode(
            php.invokeMethod({
                on: this.context.getHttpResponseClassReference(),
                method: HTTP_RESPONSE_FACTORY_METHOD_NAME,
                arguments_: [value ?? php.codeblock("null"), php.codeblock(RESPONSE_VARIABLE_NAME)],
                static_: true
            })
        );
        writer.writeLine(phpstanIgnore ? "; // @phpstan-ignore-line" : ";");
    }

    private getEndpointSuccessResponseStatements({
        endpoint,
        return_,
        raw = false
    }: {
        endpoint: FernIr.HttpEndpoint;
        return_: php.Type | undefined;
        raw?: boolean;
    }): php.CodeBlock | undefined {
        if (endpoint.response?.body == null) {
            return php.codeblock((writer) => {
                writer.controlFlow(
                    "if",
                    php.codeblock(`${STATUS_CODE_VARIABLE_NAME} >= 200 && ${STATUS_CODE_VARIABLE_NAME} < 400`)
                );
                this.writeSuccessReturn({ writer, raw });
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
                    this.writeSuccessReturn({ writer, raw, value: this.getResponseBodyString() });
                    writer.endControlFlow();
                },
                streamParameter: () => this.context.logger.error("Stream parameters not supported"),
                fileDownload: () => {
                    writer.controlFlow(
                        "if",
                        php.codeblock(`${STATUS_CODE_VARIABLE_NAME} >= 200 && ${STATUS_CODE_VARIABLE_NAME} < 400`)
                    );
                    this.writeSuccessReturn({ writer, raw, value: this.getResponseBodyString() });
                    writer.endControlFlow();
                },
                json: (_reference) => {
                    writer.controlFlow(
                        "if",
                        php.codeblock(`${STATUS_CODE_VARIABLE_NAME} >= 200 && ${STATUS_CODE_VARIABLE_NAME} < 400`)
                    );
                    if (return_ == null) {
                        this.writeSuccessReturn({ writer, raw });
                        writer.endControlFlow();
                        return;
                    }
                    writer.writeNodeStatement(this.getResponseBodyContent());
                    writer.controlFlow("if", php.codeblock(`empty(${JSON_VARIABLE_NAME})`));
                    this.writeSuccessReturn({ writer, raw, value: php.codeblock("null") });
                    writer.endControlFlow();
                    this.writeDecodedJsonReturn({ writer, raw, return_ });
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
                streaming: (streamingResponse) => {
                    streamingResponse._visit({
                        sse: (sseChunk) => {
                            const payloadType = this.context.phpTypeMapper.convert({ reference: sseChunk.payload });
                            this.writeStreamingReturn({
                                writer,
                                streamClassReference: this.context.getSseStreamClassReference(payloadType),
                                payloadType,
                                terminator: sseChunk.terminator,
                                raw
                            });
                        },
                        json: (jsonChunk) => {
                            const payloadType = this.context.phpTypeMapper.convert({ reference: jsonChunk.payload });
                            this.writeStreamingReturn({
                                writer,
                                streamClassReference: this.context.getJsonStreamClassReference(payloadType),
                                payloadType,
                                terminator: jsonChunk.terminator,
                                raw
                            });
                        },
                        text: () => {
                            writer.controlFlow(
                                "if",
                                php.codeblock(
                                    `${STATUS_CODE_VARIABLE_NAME} >= 200 && ${STATUS_CODE_VARIABLE_NAME} < 400`
                                )
                            );
                            this.writeSuccessReturn({
                                writer,
                                raw,
                                value: php.instantiateClass({
                                    classReference: this.context.getTextStreamClassReference(),
                                    arguments_: [
                                        {
                                            name: "response",
                                            assignment: php.codeblock(RESPONSE_VARIABLE_NAME)
                                        }
                                    ]
                                })
                            });
                            writer.endControlFlow();
                        },
                        _other: () => undefined
                    });
                },
                text: () => {
                    writer.controlFlow(
                        "if",
                        php.codeblock(`${STATUS_CODE_VARIABLE_NAME} >= 200 && ${STATUS_CODE_VARIABLE_NAME} < 400`)
                    );
                    this.writeSuccessReturn({ writer, raw, value: this.getResponseBodyString() });
                    writer.endControlFlow();
                },
                _other: () => undefined
            });
        });
    }

    private writeStreamingReturn({
        writer,
        streamClassReference,
        payloadType,
        terminator,
        raw
    }: {
        writer: php.Writer;
        streamClassReference: php.ClassReference;
        payloadType: php.Type;
        terminator: string | undefined;
        raw: boolean;
    }): void {
        writer.controlFlow(
            "if",
            php.codeblock(`${STATUS_CODE_VARIABLE_NAME} >= 200 && ${STATUS_CODE_VARIABLE_NAME} < 400`)
        );
        const deserializerVarName = "$data";
        const deserializerBody = this.buildStreamDeserializerBody({
            payloadType,
            variableName: deserializerVarName
        });
        const terminatorLiteral = terminator != null ? `'${terminator.replace(/'/g, "\\'")}'` : "null";
        this.writeSuccessReturn({
            writer,
            raw,
            value: php.instantiateClass({
                classReference: streamClassReference,
                arguments_: [
                    {
                        name: "response",
                        assignment: php.codeblock(RESPONSE_VARIABLE_NAME)
                    },
                    {
                        name: "deserializer",
                        assignment: php.codeblock((w) => {
                            w.write(`fn(string ${deserializerVarName}) => `);
                            w.writeNode(deserializerBody);
                        })
                    },
                    {
                        name: "terminator",
                        assignment: php.codeblock(terminatorLiteral)
                    }
                ]
            })
        });
        writer.endControlFlow();
    }

    /**
     * Builds the expression that deserializes a single stream frame's raw string into
     * the typed payload. Mirrors the dispatch in decodeJsonResponse, but emits a bare
     * expression (no statement terminator) suitable for an arrow-function body.
     */
    private buildStreamDeserializerBody({
        payloadType,
        variableName
    }: {
        payloadType: php.Type;
        variableName: string;
    }): php.CodeBlock {
        const internalType = payloadType.underlyingType().internalType;
        const argument: UnnamedArgument[] = [php.codeblock(variableName)];
        switch (internalType.type) {
            case "reference":
                return php.codeblock((writer) => {
                    writer.writeNode(
                        php.invokeMethod({
                            on: internalType.value,
                            method: "fromJson",
                            arguments_: argument,
                            static_: true
                        })
                    );
                });
            case "int":
            case "float":
            case "string":
            case "bool":
            case "date":
            case "dateTime":
            case "mixed":
            case "literal":
            case "enumString": {
                const methodSuffix = internalType.type === "enumString" ? "String" : upperFirst(internalType.type);
                return php.codeblock((writer) => {
                    writer.writeNode(
                        php.invokeMethod({
                            on: this.context.getJsonDecoderClassReference(),
                            method: `decode${methodSuffix}`,
                            arguments_: argument,
                            static_: true
                        })
                    );
                });
            }
            case "array":
            case "map":
            case "union":
            case "object":
            case "optional":
            case "null":
            case "typeDict":
                throw GeneratorError.internalError(
                    `Internal error; '${internalType.type}' type is not a supported streaming payload type`
                );
            default:
                assertNever(internalType);
        }
    }

    /**
     * The statement that deserializes a json response, and whether it carries a phpstan ignore
     * because the helper it routes to answers a type looser than the declared one. Both come out
     * of the one switch, so a new loosely typed helper cannot be added to half of it.
     */
    private decodeJsonResponse(return_: php.Type | undefined): DecodedJsonResponse {
        if (return_ == null) {
            return { code: php.codeblock(""), carriesPhpstanIgnore: false };
        }
        const arguments_: UnnamedArgument[] = [php.codeblock(JSON_VARIABLE_NAME)];
        const internalType = return_.underlyingType().internalType;
        switch (internalType.type) {
            case "reference":
                return {
                    code: this.decodeJsonResponseForClassReference({
                        arguments_,
                        classReference: internalType.value
                    }),
                    carriesPhpstanIgnore: false
                };
            case "array":
            case "map":
                return {
                    code: this.decodeJsonResponseForArray({
                        arguments_,
                        type: return_.underlyingType()
                    }),
                    carriesPhpstanIgnore: true
                };
            case "int":
            case "float":
            case "string":
            case "bool":
            case "date":
            case "dateTime":
            case "mixed":
            case "literal":
                return {
                    code: this.decodeJsonResponseForPrimitive({
                        arguments_,
                        methodSuffix: upperFirst(internalType.type)
                    }),
                    carriesPhpstanIgnore: false
                };
            case "enumString":
                return {
                    code: this.decodeJsonResponseForEnumString({
                        arguments_
                    }),
                    carriesPhpstanIgnore: true
                };
            case "union":
                return this.decodeJsonResponseForUnion({
                    arguments_,
                    types: internalType.types
                });
            case "object":
            case "optional":
            case "null":
            case "typeDict":
                throw GeneratorError.internalError(
                    `Internal error; '${internalType.type}' type is not a supported return type`
                );
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
    }): DecodedJsonResponse {
        const unionTypeParameters = this.context.phpAttributeMapper.getUnionTypeParameters({ types });
        // if deduping in getUnionTypeParameters results in one type, treat it like just that type
        // - including whether that type's own decoder suppresses anything
        if (unionTypeParameters.length === 1) {
            return this.decodeJsonResponse(types[0]);
        }
        const code = php.codeblock((writer) => {
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
        return { code, carriesPhpstanIgnore: true };
    }

    private getResponseBodyString(): php.CodeBlock {
        return php.codeblock(`${RESPONSE_VARIABLE_NAME}->getBody()->getContents()`);
    }

    /**
     * Writes the return of a json endpoint. The raw variant names the deserialized body first,
     * because the deserializer helpers emit a whole statement rather than an expression.
     */
    private writeDecodedJsonReturn({
        writer,
        raw,
        return_
    }: {
        writer: php.Writer;
        raw: boolean;
        return_: php.Type;
    }): void {
        const decoded = this.decodeJsonResponse(return_);
        if (!raw) {
            writer.write("return ");
            writer.writeNode(decoded.code);
            return;
        }
        writer.write(`${BODY_VARIABLE_NAME} = `);
        writer.writeNode(decoded.code);
        this.writeSuccessReturn({
            writer,
            raw,
            value: php.codeblock(BODY_VARIABLE_NAME),
            // Some deserializer helpers are loosely typed - `JsonDecoder::decodeArray` answers
            // `array`, an enum answers `string` - which is why the plain client's return carries an
            // ignore. Wrapping moves that same mismatch onto the raw client's return, so the ignore
            // moves with it.
            phpstanIgnore: decoded.carriesPhpstanIgnore
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
                        },
                        {
                            name: "headers",
                            assignment: php.codeblock(`${RESPONSE_VARIABLE_NAME}->getHeaders()`)
                        }
                    ],
                    multiline: true
                })
            );
        });
    }
}
