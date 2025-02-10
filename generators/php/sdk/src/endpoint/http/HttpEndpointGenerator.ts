import { upperFirst } from "lodash-es";

import { Arguments, UnnamedArgument } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { php } from "@fern-api/php-codegen";

import {
    CursorPagination,
    HttpEndpoint,
    HttpRequestBody,
    HttpService,
    OffsetPagination,
    RequestProperty,
    ResponseProperty,
    ServiceId
} from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { AbstractEndpointGenerator } from "../AbstractEndpointGenerator";
import { getEndpointReturnType } from "../utils/getEndpointReturnType";

type PagingEndpoint = HttpEndpoint & { pagination: NonNullable<HttpEndpoint["pagination"]> };

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

    public generate({
        serviceId,
        service,
        endpoint
    }: {
        serviceId: ServiceId;
        service: HttpService;
        endpoint: HttpEndpoint;
    }): php.Method[] {
        const methods: php.Method[] = [];
        if (this.hasPagination(endpoint)) {
            methods.push(this.generatePagedEndpointMethod({ serviceId, service, endpoint }));
        }

        methods.push(this.generateUnpagedEndpointMethod({ serviceId, service, endpoint }));

        return methods;
    }

    public generateUnpagedEndpointMethod({
        serviceId,
        service,
        endpoint
    }: {
        serviceId: ServiceId;
        service: HttpService;
        endpoint: HttpEndpoint;
    }): php.Method {
        const endpointSignatureInfo = this.getEndpointSignatureInfo({ serviceId, service, endpoint });
        const parameters = [...endpointSignatureInfo.baseParameters];
        parameters.push(
            php.parameter({
                name: this.context.getRequestOptionsName(),
                type: php.Type.optional(this.context.getRequestOptionsType())
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
                writer.writeNode(this.context.guzzleClient.getRequestExceptionClassReference());
                writer.writeLine(" $e) {");
                writer.indent();
                writer.writeNodeStatement(php.assignVariable(php.variable("response"), "$e->getResponse()"));
                writer.controlFlow("if", php.codeblock("$response === null"));
                writer.writeNodeStatement(
                    php.throwException({
                        classReference: this.context.getBaseExceptionClassReference(),
                        arguments_: [
                            {
                                name: "message",
                                assignment: "$e->getMessage()"
                            },
                            {
                                name: "previous",
                                assignment: php.variable("e")
                            }
                        ]
                    })
                );
                writer.endControlFlow();
                writer.writeNodeStatement(
                    php.throwException({
                        classReference: this.context.getBaseApiExceptionClassReference(),
                        arguments_: [
                            {
                                name: "message",
                                assignment: php.string("API request failed")
                            },
                            {
                                name: "statusCode",
                                assignment: "$response->getStatusCode()"
                            },
                            {
                                name: "body",
                                assignment: "$response->getBody()->getContents()"
                            }
                        ],
                        multiline: true
                    })
                );
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
        serviceId: ServiceId;
        service: HttpService;
        endpoint: HttpEndpoint;
    }): php.Method {
        this.assertHasPagination(endpoint);
        const endpointSignatureInfo = this.getEndpointSignatureInfo({ serviceId, service, endpoint });
        const parameters = [...endpointSignatureInfo.baseParameters];
        const requestOptionsType = this.context.getRequestOptionsType();
        const optionsParamName = this.context.getRequestOptionsName();
        parameters.push(
            php.parameter({
                name: optionsParamName,
                type: php.Type.optional(requestOptionsType)
            })
        );
        const itemType = this.getPaginationItemType(endpoint);
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
                            this.context.createInstanceOfPhpType(
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
                            unpagedEndpointResponseType,
                            writer,
                            optionsParamName,
                            unpagedEndpointMethodName
                        });
                        break;
                    case "cursor":
                        this.generateCursorMethodBody({
                            pagination: endpoint.pagination,
                            requestParam,
                            unpagedEndpointResponseType,
                            writer,
                            optionsParamName,
                            unpagedEndpointMethodName
                        });
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
        unpagedEndpointResponseType,
        writer,
        optionsParamName,
        unpagedEndpointMethodName
    }: {
        pagination: CursorPagination;
        requestParam: php.Parameter;
        unpagedEndpointResponseType: php.Type;
        writer: php.Writer;
        optionsParamName: string;
        unpagedEndpointMethodName: string;
    }) {
        const cursorPagerClassReference = this.context.getCursorPagerClassReference();
        writer.write("return ");
        writer.writeNodeStatement(
            php.instantiateClass({
                classReference: cursorPagerClassReference,
                arguments_: [
                    php.variable(requestParam.name),
                    php.variable(optionsParamName),
                    php.codeblock(`[$this, '${unpagedEndpointMethodName}']`),
                    php.codeblock((writer) => {
                        writer.write("fn (");
                        writer.writeNode(requestParam.type);
                        writer.write(" $request, string $cursor) => ");
                        writer.writeNode(this.context.deepSetOnPhpType(
                            php.variable("request"),
                            this.getFullPropertyPath(pagination.page),
                            php.variable("cursor"),
                        ));
                    }),
                    php.codeblock((writer) => {
                        writer.writeLine("/* @phpstan-ignore-next-line */");
                        writer.write("fn (");
                        writer.writeNode(unpagedEndpointResponseType);
                        writer.write(` $response) => ${this.nullableGet("$response", pagination.next)} ?? null`);
                    }),
                    php.codeblock((writer) => {
                        writer.writeLine("/* @phpstan-ignore-next-line */");
                        writer.write("fn (");
                        writer.writeNode(unpagedEndpointResponseType);
                        writer.write(` $response) => ${this.nullableGet("$response", pagination.results)} ?? []`);
                    })
                ],
                multiline: true
            })
        );
    }

    private generateOffsetMethodBody({
        pagination,
        requestParam,
        unpagedEndpointResponseType,
        writer,
        optionsParamName,
        unpagedEndpointMethodName
    }: {
        pagination: OffsetPagination;
        requestParam: php.Parameter;
        unpagedEndpointResponseType: php.Type;
        writer: php.Writer;
        optionsParamName: string;
        unpagedEndpointMethodName: string;
    }) {
        const offsetPagerClassReference = this.context.getOffsetPagerClassReference();
        writer.write("return ");
        writer.writeNodeStatement(
            php.instantiateClass({
                classReference: offsetPagerClassReference,
                arguments_: [
                    php.variable(requestParam.name),
                    php.variable(optionsParamName),
                    php.codeblock((writer) => {
                        writer.writeLine(`[$this, '${unpagedEndpointMethodName}']`);
                    }),
                    php.codeblock((writer) => {
                        writer.writeLine("/* @phpstan-ignore-next-line */");
                        writer.write("fn(");
                        writer.writeNode(requestParam.type);
                        writer.write(`$request) => ${this.nullableGet("$request", pagination.page)} ?? 0`);
                    }),
                    php.codeblock((writer) => {
                        writer.write("fn (");
                        writer.writeNode(requestParam.type);
                        writer.write(" $request, int $offset) => ");
                        writer.writeNode(this.context.deepSetOnPhpType(
                            php.variable("request"),
                            this.getFullPropertyPath(pagination.page),
                            php.variable("offset"),
                        ));
                    }),
                    php.codeblock((writer) => {
                        if (!pagination.step) {
                            writer.write("null");
                            return;
                        }
                        writer.writeLine("/* @phpstan-ignore-next-line */");
                        writer.write("fn(");
                        writer.writeNode(requestParam.type);
                        writer.write(` $request) => ${this.nullableGet("$request", pagination.step)} ?? 0`);
                    }),
                    php.codeblock((writer) => {
                        writer.writeLine("/* @phpstan-ignore-next-line */");
                        writer.write("fn(");
                        writer.writeNode(unpagedEndpointResponseType);
                        writer.write(` $response) => ${this.nullableGet("$response", pagination.results)} ?? []`);
                    }),
                    php.codeblock((writer) => {
                        if (!pagination.hasNextPage) {
                            writer.write("null");
                            return;
                        }

                        writer.write("fn(");
                        writer.writeNode(unpagedEndpointResponseType);
                        writer.write(` $response) => ${this.nullableGet("$response", pagination.hasNextPage)}`);
                    })
                ],
                multiline: true
            })
        );
    }

    private getFullPropertyPath(property: RequestProperty | ResponseProperty): string[] {
        return [
            ...(property.propertyPath?.map((val) => val.camelCase.safeName) ?? []),
            property.property.name.name.camelCase.safeName
        ];
    }


    private initializeNestedObjects(writer: php.Writer, variableName: string, { propertyPath }: RequestProperty) {
        if (!propertyPath || propertyPath.length === 0) {
            return;
        }

        for (let i = 0; i < propertyPath.length; i++) {
            const propertyPathPart = propertyPath.slice(0, i + 1);
            const reflectionPropVar = php.variable(
                `${variableName}${propertyPathPart.map((val) => val.pascalCase.safeName).join("")}Property`
            );
            const parentPathParts = propertyPathPart.slice(0, propertyPathPart.length - 1);
            const parentObject =
                parentPathParts.length === 0
                    ? variableName
                    : `${variableName}->${parentPathParts.map((val) => val.camelCase.safeName).join("->")}`;
            const prop = propertyPathPart[propertyPathPart.length - 1]!;
            writer.writeLine(`if (${parentObject}->${prop.camelCase.safeName} == null) {`);
            writer.indent();
            writer.writeNodeStatement(
                php.assignVariable(
                    reflectionPropVar,
                    php.instantiateClass({
                        classReference: this.context.getReflectionPropertyClassReference(),
                        arguments_: [php.codeblock(parentObject), php.string(prop.camelCase.safeName)]
                    })
                )
            );
            writer.writeLine("/* @phpstan-ignore-next-line */");
            writer.writeNodeStatement(
                php.assignVariable(
                    php.codeblock(
                        `${variableName}->${propertyPathPart.map((val) => val.camelCase.safeName).join("->")}`
                    ),
                    this.context.createInstanceOfPhpType(
                        php.codeblock((writer) => {
                            writer.writeNode(reflectionPropVar);
                            writer.write("->getType()->getName()");
                        })
                    )
                )
            );
            writer.dedent();
            writer.writeLine("}");
        }
    }

    private get(variableName: string, { property, propertyPath }: RequestProperty | ResponseProperty): string {
        if (!propertyPath || propertyPath.length === 0) {
            return `${variableName}->${property.name.name.camelCase.safeName}`;
        }

        return `${variableName}->${propertyPath.map((val) => val.camelCase.safeName).join("->")}->${
            property.name.name.camelCase.safeName
        }`;
    }

    private nullableGet(variableName: string, { property, propertyPath }: RequestProperty | ResponseProperty): string {
        if (!propertyPath || propertyPath.length === 0) {
            return `${variableName}->${property.name.name.camelCase.safeName}`;
        }

        return `${variableName}->${propertyPath.map((val) => val.camelCase.safeName).join("?->")}?->${
            property.name.name.camelCase.safeName
        }`;
    }

    protected getPagerReturnType(endpoint: HttpEndpoint): php.Type {
        const itemType = this.getPaginationItemType(endpoint);
        const pager = this.context.getPagerClassReference(itemType);
        return php.Type.reference(pager);
    }

    protected getPaginationItemType(endpoint: HttpEndpoint): php.Type {
        this.assertHasPagination(endpoint);
        const listItemType = this.context.phpTypeMapper.convert({
            reference: (() => {
                switch (endpoint.pagination.type) {
                    case "offset":
                        return endpoint.pagination.results.property.valueType;
                    case "cursor":
                        return endpoint.pagination.results.property.valueType;
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
                `Pagination result type for endpoint ${endpoint.name.originalName} must be an array, but is an optional ${listItemType.internalType.value.internalType.type}.`
            );
        }

        if (listItemType.internalType.type === "array") {
            return listItemType.internalType.value;
        }

        throw new Error(
            `Pagination result type for endpoint ${endpoint.name.originalName} must be an array, but is ${listItemType.internalType.type}.`
        );
    }

    protected hasPagination(endpoint: HttpEndpoint): endpoint is PagingEndpoint {
        if (!this.context.config.generatePaginatedClients) {
            return false;
        }
        return endpoint.pagination !== undefined;
    }

    protected assertHasPagination(endpoint: HttpEndpoint): asserts endpoint is PagingEndpoint {
        if (this.hasPagination(endpoint)) {
            return;
        }
        throw new Error(`Endpoint ${endpoint.name.originalName} is not a paginated endpoint`);
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
                bytes: () => this.context.logger.error("Bytes not supported"),
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
