import { assertNever } from "@fern-api/core-utils";
import { go } from "@fern-api/go-ast";

import {
    BooleanType,
    DoubleType,
    HttpEndpoint,
    HttpRequestBody,
    HttpResponseBody,
    HttpService,
    IntegerType,
    JsonResponse,
    LongType,
    Pagination,
    SdkRequestBodyType,
    ServiceId,
    StreamingResponse,
    StringType,
    Subpackage,
    TypeReference
} from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { AbstractEndpointGenerator } from "../AbstractEndpointGenerator";
import { EndpointSignatureInfo } from "../EndpointSignatureInfo";
import { getPaginationInfo } from "../utils/getPaginationInfo";

export declare namespace HttpEndpointGenerator {
    export const OCTET_STREAM_CONTENT_TYPE = "application/octet-stream";

    export interface Args {
        endpoint: HttpEndpoint;
    }
}

export class HttpEndpointGenerator extends AbstractEndpointGenerator {
    public constructor({ context }: { context: SdkGeneratorContext }) {
        super({ context });
    }

    public generate({
        serviceId,
        service,
        subpackage,
        endpoint
    }: {
        serviceId: ServiceId;
        service: HttpService;
        subpackage: Subpackage | undefined;
        endpoint: HttpEndpoint;
    }): go.Method | undefined {
        const signature = this.getEndpointSignatureInfo({ serviceId, service, endpoint });
        return this.generateEndpoint({ service, endpoint, signature, subpackage });
    }

    private generateEndpoint({
        service,
        endpoint,
        signature,
        subpackage
    }: {
        service: HttpService;
        endpoint: HttpEndpoint;
        signature: EndpointSignatureInfo;
        subpackage: Subpackage | undefined;
    }): go.Method {
        return new go.Method({
            name: this.context.getMethodName(endpoint.name),
            parameters: signature.allParameters,
            return_: this.getReturnSignature({ endpoint, signature }),
            body: this.getEndpointBody({ signature, endpoint, subpackage }),
            typeReference: this.context.getClientClassReference({
                fernFilepath: service.name.fernFilepath,
                subpackage
            }),
            pointerReceiver: true,
            docs: endpoint.docs
        });
    }

    private shouldGenerateRawEndpoint({ endpoint }: { endpoint: HttpEndpoint }): boolean {
        return !this.context.isEnabledPaginationEndpoint(endpoint) && !this.context.isStreamingEndpoint(endpoint);
    }

    private getEndpointBody({
        signature,
        endpoint,
        subpackage
    }: {
        signature: EndpointSignatureInfo;
        endpoint: HttpEndpoint;
        subpackage: Subpackage | undefined;
    }): go.CodeBlock {
        const streamingResponse = this.context.getStreamingResponse(endpoint);
        if (streamingResponse != null) {
            return this.getStreamingEndpointBody({
                signature,
                endpoint,
                subpackage,
                streamingResponse
            });
        }
        const pagination = this.context.getPagination(endpoint);
        if (pagination != null && this.context.isEnabledPaginationEndpoint(endpoint)) {
            return this.getPaginationEndpointBody({ signature, endpoint, subpackage, pagination });
        }
        if (pagination?.type === "custom" && this.context.customConfig.customPagerName != null) {
            return this.getCustomPaginationEndpointBody({ signature, endpoint, subpackage });
        }
        return this.generateDelegatingEndpointBody({ endpoint, signature, subpackage });
    }

    private getStreamingEndpointBody({
        signature,
        endpoint,
        subpackage,
        streamingResponse
    }: {
        signature: EndpointSignatureInfo;
        endpoint: HttpEndpoint;
        subpackage: Subpackage | undefined;
        streamingResponse: StreamingResponse;
    }): go.CodeBlock {
        const errorDecoder = this.buildErrorDecoder({ endpoint });
        const streamPayload = this.context.getStreamPayload(streamingResponse);
        const streamerVariable = go.codeblock("streamer");
        return go.codeblock((writer) => {
            writer.writeNode(
                this.prepareRequestCall({
                    signature,
                    endpoint,
                    subpackage,
                    errorDecoder: undefined, // Do not need to build the error decoder here since its built globally for all endpoint errors
                    rawClient: false
                })
            );
            writer.newLine();
            writer.writeNode(streamerVariable);
            writer.write(" := ");
            writer.writeNode(
                this.context.callNewStreamer({
                    arguments_: [this.getCallerFieldReference({ subpackage })],
                    streamPayload
                })
            );
            writer.newLine();
            writer.write("return ");
            writer.writeNode(
                this.context.streamer.stream({
                    endpoint,
                    streamerVariable,
                    optionsReference: go.codeblock("options"),
                    url: go.codeblock("endpointURL"),
                    request: signature.request?.getRequestReference(),
                    errorCodes: errorDecoder != null ? go.codeblock("errorCodes") : undefined,
                    streamingResponse
                })
            );
        });
    }

    private getPaginationEndpointBody({
        signature,
        endpoint,
        subpackage,
        pagination
    }: {
        signature: EndpointSignatureInfo;
        endpoint: HttpEndpoint;
        subpackage: Subpackage | undefined;
        pagination: Pagination;
    }): go.CodeBlock {
        const errorDecoder = this.buildErrorDecoder({ endpoint });
        const paginationInfo = getPaginationInfo({
            context: this.context,
            pagination,
            signature,
            callerReference: this.getCallerFieldReference({ subpackage }),
            endpoint,
            errorDecoder
        });
        return go.codeblock((writer) => {
            writer.writeNode(
                this.prepareRequestCall({
                    signature,
                    endpoint,
                    subpackage,
                    errorDecoder: undefined, // Do not need to build the error decoder here since its built globally for all endpoint errors
                    rawClient: false,
                    encodeQuery: false
                })
            );
            writer.newLine();
            writer.writeNode(paginationInfo.prepareCall);
            writer.writeNewLineIfLastLineNot();
            writer.writeNode(paginationInfo.readPageResponse);
            writer.writeNewLineIfLastLineNot();
            writer.writeNode(paginationInfo.initializePager);
            writer.writeNewLineIfLastLineNot();
            writer.writeNode(paginationInfo.callGetPage);
            writer.writeNewLineIfLastLineNot();
        });
    }

    private getCustomPaginationEndpointBody({
        signature,
        endpoint,
        subpackage
    }: {
        signature: EndpointSignatureInfo;
        endpoint: HttpEndpoint;
        subpackage: Subpackage | undefined;
    }): go.CodeBlock {
        const errorDecoder = this.buildErrorDecoder({ endpoint });
        return go.codeblock((writer) => {
            writer.writeNode(
                this.prepareRequestCall({
                    signature,
                    endpoint,
                    subpackage,
                    errorDecoder: undefined,
                    rawClient: false
                })
            );
            writer.newLine();
            const responseBody = endpoint.response?.body;
            if (responseBody == null) {
                writer.writeLine("return nil, nil");
                return;
            }
            let baseResponseType: go.Type;
            switch (responseBody.type) {
                case "json":
                    baseResponseType = this.context.goTypeMapper.convert({
                        reference: responseBody.value.responseBodyType
                    });
                    break;
                case "fileDownload":
                case "text":
                    baseResponseType = go.Type.string();
                    break;
                case "bytes":
                    throw new Error("Returning bytes is not supported");
                case "streaming":
                case "streamParameter":
                    throw new Error("Custom pagination with streaming is not supported");
                default:
                    assertNever(responseBody);
            }
            writer.write("var response ");
            writer.writeNode(baseResponseType);
            writer.newLine();
            writer.write("_, err := ");
            writer.writeNode(
                this.context.caller.call({
                    endpoint,
                    clientReference: this.getCallerFieldReference({ subpackage }),
                    optionsReference: go.codeblock("options"),
                    url: go.codeblock("endpointURL"),
                    request: signature.request?.getRequestReference(),
                    response: this.getResponseParameterReference({ endpoint }),
                    errorCodes: errorDecoder != null ? go.codeblock("errorCodes") : undefined
                })
            );
            writer.newLine();
            writer.writeLine("if err != nil {");
            writer.indent();
            writer.writeNode(this.writeReturnZeroValueWithError({ signature }));
            writer.newLine();
            writer.dedent();
            writer.writeLine("}");
            writer.write("base := ");
            writer.writeNode(
                go.invokeFunc({
                    func: go.typeReference({
                        name: "NewCustomPager",
                        importPath: this.context.getCoreImportPath()
                    }),
                    arguments_: [
                        this.getResponseBodyReference({ responseBody }),
                        go.codeblock("nil"),
                        go.codeblock("nil"),
                        go.codeblock("nil"),
                        go.codeblock("nil")
                    ]
                })
            );
            writer.newLine();
            const customPagerName = this.context.customConfig.customPagerName ?? "CustomPager";
            writer.write(`pager := &core.${customPagerName}[`);
            writer.writeNode(baseResponseType);
            writer.write("]{CustomPager: base}");
            writer.newLine();
            writer.writeLine("return pager, nil");
        });
    }

    private generateDelegatingEndpointBody({
        endpoint,
        signature,
        subpackage
    }: {
        endpoint: HttpEndpoint;
        signature: EndpointSignatureInfo;
        subpackage: Subpackage | undefined;
    }): go.CodeBlock {
        return go.codeblock((writer) => {
            if (signature.returnType != null) {
                writer.write("response, err := ");
            } else {
                writer.write("_, err := ");
            }
            writer.writeNode(
                go.invokeMethod({
                    method: this.context.getMethodName(endpoint.name),
                    arguments_: [
                        ...signature.allParameters.slice(0, -1).map((param) => go.codeblock(param.name)),
                        go.codeblock("opts...")
                    ],
                    on: go.selector({
                        on: this.getReceiverCodeBlock({ subpackage }),
                        selector: go.codeblock("WithRawResponse")
                    })
                })
            );
            writer.newLine();
            writer.writeLine("if err != nil {");
            writer.indent();
            writer.writeNode(this.writeReturnZeroValueWithError({ signature }));
            writer.newLine();
            writer.dedent();
            writer.writeLine("}");
            writer.writeNode(this.getResponseReturnStatement({ signature, endpoint }));
            writer.newLine();
        });
    }

    public generateRaw({
        serviceId,
        service,
        subpackage,
        endpoint
    }: {
        serviceId: ServiceId;
        service: HttpService;
        subpackage: Subpackage | undefined;
        endpoint: HttpEndpoint;
    }): go.Method | undefined {
        if (!this.shouldGenerateRawEndpoint({ endpoint })) {
            return undefined;
        }
        const signature = this.getEndpointSignatureInfo({ serviceId, service, endpoint });
        return this.generateRawEndpoint({ service, endpoint, signature, subpackage });
    }

    private generateRawEndpoint({
        service,
        endpoint,
        signature,
        subpackage
    }: {
        service: HttpService;
        endpoint: HttpEndpoint;
        signature: EndpointSignatureInfo;
        subpackage: Subpackage | undefined;
    }): go.Method {
        return new go.Method({
            name: this.context.getMethodName(endpoint.name),
            parameters: signature.allParameters,
            return_: this.getRawReturnSignature({ signature }),
            body: this.getRawUnaryEndpointBody({ signature, endpoint, subpackage }),
            typeReference: this.context.getRawClientClassReference({
                fernFilepath: service.name.fernFilepath,
                subpackage
            }),
            pointerReceiver: true
        });
    }

    private getRawUnaryEndpointBody({
        signature,
        endpoint,
        subpackage
    }: {
        signature: EndpointSignatureInfo;
        endpoint: HttpEndpoint;
        subpackage: Subpackage | undefined;
    }): go.CodeBlock {
        const errorDecoder = this.buildErrorDecoder({ endpoint });
        return go.codeblock((writer) => {
            writer.writeNode(
                this.prepareRequestCall({
                    signature,
                    endpoint,
                    subpackage,
                    errorDecoder: undefined, // Do not need to build the error decoder here since its built globally for all endpoint errors
                    rawClient: true
                })
            );
            writer.newLine();
            writer.write("raw, err := ");
            writer.writeNode(
                this.context.caller.call({
                    endpoint,
                    clientReference: this.getCallerFieldReference({ rawClient: true }),
                    optionsReference: go.codeblock("options"),
                    url: go.codeblock("endpointURL"),
                    request: signature.request?.getRequestReference(),
                    response: this.getResponseParameterReference({ endpoint }),
                    errorCodes: errorDecoder != null ? go.codeblock("errorCodes") : undefined
                })
            );
            writer.newLine();
            writer.writeLine("if err != nil {");
            writer.indent();
            writer.writeNode(this.writeReturnZeroValueWithError({ signature, rawClient: true }));
            writer.newLine();
            writer.dedent();
            writer.writeLine("}");
            writer.writeNode(this.getRawResponseReturnStatement({ endpoint, signature }));
        });
    }

    private prepareRequestCall({
        signature,
        endpoint,
        subpackage,
        errorDecoder,
        rawClient,
        encodeQuery = true
    }: {
        signature: EndpointSignatureInfo;
        endpoint: HttpEndpoint;
        subpackage: Subpackage | undefined;
        errorDecoder: go.CodeBlock | undefined;
        rawClient: boolean;
        encodeQuery?: boolean;
    }): go.CodeBlock {
        return go.codeblock((writer) => {
            writer.writeNode(this.buildRequestOptions({ endpoint }));
            writer.newLine();
            writer.writeNode(this.buildBaseUrl({ endpoint, subpackage, rawClient }));
            writer.newLine();
            writer.writeNode(this.buildEndpointUrl({ endpoint, signature }));

            const buildQueryParameters = this.buildQueryParameters({
                signature,
                endpoint,
                rawClient,
                encodeQuery
            });
            if (buildQueryParameters != null) {
                writer.newLine();
                writer.writeNode(buildQueryParameters);
            }

            const buildHeaders = this.buildHeaders({ endpoint, subpackage, rawClient });
            writer.writeNewLineIfLastLineNot();
            writer.writeNode(buildHeaders);

            if (errorDecoder != null) {
                writer.newLine();
                writer.writeNode(errorDecoder);
            }

            const requestBody = signature.request?.getRequestBodyBlock();
            if (requestBody != null) {
                writer.newLine();
                writer.writeNode(requestBody);
            }

            const responseInitialization = this.getResponseInitialization({ endpoint });
            if (responseInitialization != null) {
                writer.newLine();
                writer.writeNode(responseInitialization);
            }
        });
    }

    private buildRequestOptions({ endpoint }: { endpoint: HttpEndpoint }): go.CodeBlock {
        const requestOptions = endpoint.idempotent
            ? this.context.callNewIdempotentRequestOptions(go.codeblock("opts..."))
            : this.context.callNewRequestOptions(go.codeblock("opts..."));

        return go.codeblock((writer) => {
            writer.write("options := ");
            writer.writeNode(requestOptions);
        });
    }

    private buildBaseUrl({
        endpoint,
        subpackage,
        rawClient
    }: {
        endpoint: HttpEndpoint;
        subpackage: Subpackage | undefined;
        rawClient?: boolean;
    }): go.CodeBlock {
        return go.codeblock((writer) => {
            writer.write("baseURL := ");
            writer.writeNode(
                this.context.callResolveBaseURL([
                    go.selector({
                        on: go.codeblock("options"),
                        selector: go.codeblock("BaseURL")
                    }),
                    go.selector({
                        on: this.getReceiverCodeBlock({ subpackage, rawClient }),
                        selector: go.codeblock("baseURL")
                    }),
                    this.context.getDefaultBaseUrlTypeInstantiation(endpoint)
                ])
            );
        });
    }

    private buildEndpointUrl({
        endpoint,
        signature
    }: {
        endpoint: HttpEndpoint;
        signature: EndpointSignatureInfo;
    }): go.CodeBlock {
        const pathSuffix = this.getPathSuffix({ endpoint });
        const baseUrl = pathSuffix.length === 0 ? "baseURL" : `baseURL + "/${pathSuffix}"`;
        return go.codeblock((writer) => {
            writer.write("endpointURL := ");
            if (endpoint.allPathParameters.length === 0) {
                writer.write(baseUrl);
                return;
            }
            const pathParameterReferences: go.AstNode[] = [];
            for (const pathParameter of endpoint.allPathParameters) {
                const pathParameterReference = signature.pathParameterReferences[pathParameter.name.originalName];
                if (pathParameterReference == null) {
                    continue;
                }
                pathParameterReferences.push(go.codeblock(pathParameterReference));
            }
            writer.writeNode(this.context.callEncodeUrl([go.codeblock(baseUrl), ...pathParameterReferences]));
        });
    }

    // Extracts the default field from a TypeReference as a TypeInstantiation.
    private extractDefaultValue(typeReference: TypeReference): go.TypeInstantiation | undefined {
        switch (typeReference.type) {
            case "container":
                if (typeReference.container.type === "optional") {
                    return this.extractDefaultValue(typeReference.container.optional);
                }
                if (typeReference.container.type === "nullable") {
                    return this.extractDefaultValue(typeReference.container.nullable);
                }
                return undefined;
            case "named": {
                const typeDeclaration = this.context.getTypeDeclarationOrThrow(typeReference.typeId);
                if (typeDeclaration.shape.type === "alias") {
                    return this.extractDefaultValue(typeDeclaration.shape.aliasOf);
                }
                return undefined;
            }
            case "primitive":
                if (!typeReference.primitive.v2) {
                    return undefined;
                }

                return typeReference.primitive.v2._visit<go.TypeInstantiation | undefined>({
                    integer: (integerType: IntegerType) => {
                        if (integerType.default != null) {
                            return go.TypeInstantiation.int(integerType.default);
                        }
                        return undefined;
                    },
                    long: (longType: LongType) => {
                        if (longType.default != null) {
                            return go.TypeInstantiation.int64(longType.default);
                        }
                        return undefined;
                    },
                    double: (doubleType: DoubleType) => {
                        if (doubleType.default != null) {
                            return go.TypeInstantiation.float64(doubleType.default);
                        }
                        return undefined;
                    },
                    string: (stringType: StringType) => {
                        if (stringType.default != null) {
                            return go.TypeInstantiation.string(stringType.default);
                        }
                        return undefined;
                    },
                    boolean: (booleanType: BooleanType) => {
                        if (booleanType.default != null) {
                            return go.TypeInstantiation.bool(booleanType.default);
                        }
                        return undefined;
                    },
                    uint: () => undefined,
                    uint64: () => undefined,
                    float: () => undefined,
                    date: () => undefined,
                    dateTime: () => undefined,
                    uuid: () => undefined,
                    base64: () => undefined,
                    bigInteger: () => undefined,
                    _other: () => undefined
                });
            case "unknown":
                return undefined;
            default:
                assertNever(typeReference);
        }
    }

    private buildQueryParameters({
        signature,
        endpoint,
        encodeQuery,
        rawClient
    }: {
        signature: EndpointSignatureInfo;
        endpoint: HttpEndpoint;
        encodeQuery: boolean;
        rawClient?: boolean;
    }): go.CodeBlock | undefined {
        const endpointRequest = signature.request;
        if (endpointRequest == null || endpoint.queryParameters.length === 0) {
            return undefined;
        }

        // extract and populate defaults
        const defaults = [];
        if (this.context.customConfig.useDefaultRequestParameterValues) {
            for (const queryParameter of endpoint.queryParameters) {
                const defaultValue = this.extractDefaultValue(queryParameter.valueType);
                if (!defaultValue) {
                    continue;
                }
                defaults.push({
                    key: go.TypeInstantiation.string(queryParameter.name.wireValue),
                    value: defaultValue
                });
            }
        }
        const defaults_map = go.TypeInstantiation.map({
            keyType: go.Type.string(),
            valueType: go.Type.any(),
            entries: defaults
        });

        return go.codeblock((writer) => {
            writer.write("queryParams, err := ");
            if (!defaults.length) {
                writer.writeNode(
                    this.context.callQueryValues([go.codeblock(endpointRequest.getRequestParameterName())])
                );
            } else {
                writer.writeNode(
                    this.context.callQueryValuesWithDefaults([
                        go.codeblock(endpointRequest.getRequestParameterName()),
                        defaults_map
                    ])
                );
            }
            writer.newLine();
            writer.writeLine("if err != nil {");
            writer.indent();
            writer.writeNode(this.writeReturnZeroValueWithError({ signature, rawClient }));
            writer.newLine();
            writer.dedent();
            writer.writeLine("}");
            for (const queryParameter of endpoint.queryParameters) {
                const literal = this.context.maybeLiteral(queryParameter.valueType);
                if (literal != null) {
                    writer.writeNode(
                        this.addQueryValue({
                            wireValue: queryParameter.name.wireValue,
                            value: this.context.getLiteralAsString(literal)
                        })
                    );
                    writer.newLine();
                    continue;
                }
            }
            if (encodeQuery) {
                this.encodeQuery({ writer, endpointUrlReference: go.codeblock("endpointURL") });
            }
        });
    }

    private encodeQuery({
        writer,
        endpointUrlReference
    }: {
        writer: go.Writer;
        endpointUrlReference: go.AstNode;
    }): void {
        writer.writeLine("if len(queryParams) > 0 {");
        writer.indent();
        writer.writeNode(endpointUrlReference);
        writer.writeLine(' += "?" + queryParams.Encode()');
        writer.dedent();
        writer.writeLine("}");
    }

    private buildHeaders({
        endpoint,
        subpackage,
        rawClient
    }: {
        endpoint: HttpEndpoint;
        subpackage: Subpackage | undefined;
        rawClient?: boolean;
    }): go.CodeBlock {
        return go.codeblock((writer) => {
            writer.write("headers := ");
            writer.writeNode(
                this.context.callMergeHeaders([
                    go.selector({
                        on: this.getReceiverCodeBlock({ subpackage, rawClient }),
                        selector: go.codeblock("options.ToHeader()")
                    }),
                    go.codeblock("options.ToHeader()")
                ])
            );
            for (const header of endpoint.headers) {
                const literal = this.context.maybeLiteral(header.valueType);
                if (literal != null) {
                    writer.writeNode(
                        this.addHeaderValue({
                            wireValue: header.name.wireValue,
                            value: go.codeblock(this.context.getLiteralAsString(literal))
                        })
                    );
                    continue;
                }
                const headerField = `${this.getRequestParameterName({ endpoint })}.${this.context.getFieldName(header.name.name)}`;
                const format = this.context.goValueFormatter.convert({
                    reference: header.valueType,
                    value: go.codeblock(headerField)
                });
                if (format.isOptional) {
                    writer.writeNewLineIfLastLineNot();
                    writer.writeLine(`if ${headerField} != nil {`);
                    writer.indent();
                    writer.writeNode(
                        this.addHeaderValue({ wireValue: header.name.wireValue, value: format.formatted })
                    );
                    writer.newLine();
                    writer.dedent();
                    writer.writeLine("}");
                    continue;
                }
                writer.writeNode(this.addHeaderValue({ wireValue: header.name.wireValue, value: format.formatted }));
            }
            const acceptHeader = this.getAcceptHeaderValue({ endpoint });
            if (acceptHeader != null) {
                writer.writeNode(this.setHeaderValue({ wireValue: "Accept", value: acceptHeader }));
            }
            const contentTypeHeader = this.getContentTypeHeaderValue({ endpoint });
            if (contentTypeHeader != null) {
                writer.writeNode(this.setHeaderValue({ wireValue: "Content-Type", value: contentTypeHeader }));
            }
        });
    }

    private buildErrorDecoder({ endpoint }: { endpoint: HttpEndpoint }): go.CodeBlock | undefined {
        if (endpoint.errors.length === 0) {
            return undefined;
        }
        return go.codeblock((writer) => {
            writer.write("errorCodes := ");
            writer.writeNode(
                go.TypeInstantiation.struct({
                    typeReference: this.context.getErrorCodesTypeReference(),
                    fields: endpoint.errors.map((error) => {
                        const errorDeclaration = this.context.getErrorDeclarationOrThrow(error.error.errorId);
                        const errorTypeReference = go.typeReference({
                            name: this.context.getClassName(errorDeclaration.name.name),
                            importPath: this.context.getLocationForErrorId(errorDeclaration.name.errorId).importPath
                        });
                        return {
                            name: errorDeclaration.statusCode.toString(),
                            value: go.TypeInstantiation.reference(
                                go.func({
                                    parameters: [
                                        go.parameter({
                                            name: "apiError",
                                            type: go.Type.pointer(
                                                go.Type.reference(this.context.getCoreApiErrorTypeReference())
                                            )
                                        })
                                    ],
                                    return_: [go.Type.error()],
                                    body: go.codeblock((writer) => {
                                        writer.write("return ");
                                        writer.writeNode(
                                            go.TypeInstantiation.structPointer({
                                                typeReference: errorTypeReference,
                                                fields: [
                                                    {
                                                        name: "APIError",
                                                        value: go.TypeInstantiation.reference(go.codeblock("apiError"))
                                                    }
                                                ]
                                            })
                                        );
                                    }),
                                    multiline: false
                                })
                            )
                        };
                    })
                })
            );
        });
    }

    private getResponseInitialization({ endpoint }: { endpoint: HttpEndpoint }): go.CodeBlock | undefined {
        const responseBody = endpoint.response?.body;
        const pagination = this.context.getPagination(endpoint);
        const isCustomPagination = pagination?.type === "custom" && this.context.customConfig.customPagerName != null;
        if (responseBody == null || this.context.isEnabledPaginationEndpoint(endpoint) || isCustomPagination) {
            return undefined;
        }
        switch (responseBody.type) {
            case "json":
                return go.codeblock((writer) => {
                    writer.write("var response ");
                    writer.writeNode(
                        this.context.goTypeMapper.convert({ reference: responseBody.value.responseBodyType })
                    );
                });
            case "fileDownload":
            case "text":
                return go.codeblock((writer) => {
                    writer.write("response := ");
                    writer.writeNode(this.context.callBytesNewBuffer());
                });
            case "streaming":
            case "streamParameter":
            case "bytes":
                return undefined;
            default:
                assertNever(responseBody);
        }
    }

    private getResponseParameterReference({ endpoint }: { endpoint: HttpEndpoint }): go.CodeBlock | undefined {
        const responseBody = endpoint.response?.body;
        if (responseBody == null) {
            return undefined;
        }
        switch (responseBody.type) {
            case "json":
                return go.codeblock("&response");
            case "bytes":
            case "fileDownload":
            case "text":
            case "streaming":
            case "streamParameter":
                return go.codeblock("response");
            default:
                assertNever(responseBody);
        }
    }

    private getResponseReturnStatement({
        signature,
        endpoint
    }: {
        signature: EndpointSignatureInfo;
        endpoint: HttpEndpoint;
    }): go.CodeBlock {
        return go.codeblock((writer) => {
            writer.write("return ");
            if (signature.returnType != null) {
                writer.writeNode(
                    go.selector({
                        on: go.codeblock("response"),
                        selector: endpoint.method === "HEAD" ? go.codeblock("Header") : go.codeblock("Body")
                    })
                );
                writer.write(", ");
            }
            writer.write("nil");
        });
    }

    private getRawResponseReturnStatement({
        endpoint,
        signature
    }: {
        endpoint: HttpEndpoint;
        signature: EndpointSignatureInfo;
    }): go.CodeBlock {
        const responseBody = endpoint.response?.body;
        const responseBodyReference =
            responseBody == null ? go.TypeInstantiation.nil() : this.getResponseBodyReference({ responseBody });
        return go.codeblock((writer) => {
            writer.write("return ");
            if (signature.rawReturnTypeReference != null) {
                writer.writeNode(
                    this.wrapWithRawResponseType({
                        rawReturnTypeReference: signature.rawReturnTypeReference,
                        responseBodyReference
                    })
                );
                writer.write(", ");
            }
            writer.write("nil");
        });
    }

    private getResponseBodyReference({ responseBody }: { responseBody: HttpResponseBody }): go.CodeBlock {
        switch (responseBody.type) {
            case "json":
                return this.getResponseBodyReferenceForJson({ jsonResponse: responseBody.value });
            case "bytes":
            case "fileDownload":
            case "streaming":
            case "streamParameter":
                return go.codeblock("response");
            case "text":
                return go.codeblock("response.String()");
            default:
                assertNever(responseBody);
        }
    }

    private getResponseBodyReferenceForJson({ jsonResponse }: { jsonResponse: JsonResponse }): go.CodeBlock {
        switch (jsonResponse.type) {
            case "response":
                return go.codeblock("response");
            case "nestedPropertyAsResponse": {
                const responseProperty = jsonResponse.responseProperty;
                if (responseProperty == null) {
                    return go.codeblock("response");
                }
                return go.codeblock(`response.${this.context.getFieldName(responseProperty.name.name)}`);
            }
            default:
                assertNever(jsonResponse);
        }
    }

    private wrapWithRawResponseType({
        rawReturnTypeReference,
        responseBodyReference
    }: {
        rawReturnTypeReference: go.TypeReference;
        responseBodyReference: go.AstNode;
    }): go.TypeInstantiation {
        return go.TypeInstantiation.structPointer({
            typeReference: rawReturnTypeReference,
            fields: [
                {
                    name: "StatusCode",
                    value: go.TypeInstantiation.reference(go.codeblock("raw.StatusCode"))
                },
                {
                    name: "Header",
                    value: go.TypeInstantiation.reference(go.codeblock("raw.Header"))
                },
                {
                    name: "Body",
                    value: go.TypeInstantiation.reference(responseBodyReference)
                }
            ]
        });
    }

    private getPathSuffix({ endpoint }: { endpoint: HttpEndpoint }): string {
        let pathSuffix = endpoint.fullPath.head === "/" ? "" : endpoint.fullPath.head;
        for (const part of endpoint.fullPath.parts) {
            if (part.pathParameter) {
                pathSuffix += "%v";
            }
            pathSuffix += part.tail;
        }
        return pathSuffix.replace(/^\/+/, "");
    }

    private getAcceptHeaderValue({ endpoint }: { endpoint: HttpEndpoint }): string | undefined {
        const responseBody = endpoint.response?.body;
        if (responseBody == null) {
            return undefined;
        }
        switch (responseBody.type) {
            case "streaming":
                return this.getAcceptHeaderValueForStreaming({ streamingResponse: responseBody.value });
            case "bytes":
            case "fileDownload":
            case "json":
            case "streamParameter":
            case "text":
                return undefined;
            default:
                assertNever(responseBody);
        }
    }

    private getAcceptHeaderValueForStreaming({
        streamingResponse
    }: {
        streamingResponse: StreamingResponse;
    }): string | undefined {
        switch (streamingResponse.type) {
            case "sse":
                return "text/event-stream";
            case "json":
            case "text":
                return undefined;
            default:
                assertNever(streamingResponse);
        }
    }

    private getContentTypeHeaderValue({ endpoint }: { endpoint: HttpEndpoint }): string | undefined {
        const sdkRequest = endpoint.sdkRequest;
        if (sdkRequest == null) {
            return undefined;
        }
        switch (sdkRequest.shape.type) {
            case "justRequestBody":
                return this.getContentTypeHeaderValueForJustRequestBody({ justRequestBody: sdkRequest.shape.value });
            case "wrapper": {
                const requestBody = endpoint.requestBody;
                if (requestBody == null) {
                    return undefined;
                }
                return this.getContentTypeHeaderValueForWrapper({ requestBody });
            }
            default:
                assertNever(sdkRequest.shape);
        }
    }

    private getContentTypeHeaderValueForJustRequestBody({
        justRequestBody
    }: {
        justRequestBody: SdkRequestBodyType;
    }): string | undefined {
        switch (justRequestBody.type) {
            case "bytes":
                return justRequestBody.contentType ?? HttpEndpointGenerator.OCTET_STREAM_CONTENT_TYPE;
            case "typeReference":
                return justRequestBody.contentType;
            default:
                assertNever(justRequestBody);
        }
    }

    private getContentTypeHeaderValueForWrapper({ requestBody }: { requestBody: HttpRequestBody }): string | undefined {
        switch (requestBody.type) {
            case "bytes":
                return requestBody.contentType ?? HttpEndpointGenerator.OCTET_STREAM_CONTENT_TYPE;
            case "inlinedRequestBody":
            case "reference":
                return requestBody.contentType;
            case "fileUpload":
                // The Content-Type boundary is generated by the multipart/form-data writer.
                return undefined;
            default:
                assertNever(requestBody);
        }
    }

    private addHeaderValue({ wireValue, value }: { wireValue: string; value: go.AstNode }): go.CodeBlock {
        return go.codeblock((writer) => {
            writer.writeNewLineIfLastLineNot();
            writer.write(`headers.Add("${wireValue}", `);
            writer.writeNode(value);
            writer.write(")");
        });
    }

    private addQueryValue({ wireValue, value }: { wireValue: string; value: string }): go.CodeBlock {
        return go.codeblock((writer) => {
            writer.writeNewLineIfLastLineNot();
            writer.write(`queryParams.Add("${wireValue}", "${value}")`);
        });
    }

    private setHeaderValue({ wireValue, value }: { wireValue: string; value: string }): go.CodeBlock {
        return go.codeblock((writer) => {
            writer.writeNewLineIfLastLineNot();
            writer.write(`headers.Add("${wireValue}", "${value}")`);
        });
    }

    private writeReturnZeroValueWithError({
        signature,
        rawClient
    }: {
        signature: EndpointSignatureInfo;
        rawClient?: boolean;
    }): go.CodeBlock {
        if (rawClient) {
            return go.codeblock("return nil, err");
        }
        return go.codeblock((writer) => {
            writer.write("return ");
            if (signature.returnZeroValue != null) {
                writer.writeNode(signature.returnZeroValue);
                writer.write(", ");
            }
            writer.write("err");
        });
    }

    private getCallerFieldReference({
        subpackage,
        rawClient
    }: {
        subpackage?: Subpackage;
        rawClient?: boolean;
    }): go.AstNode {
        return go.selector({
            on: this.getReceiverCodeBlock({ subpackage, rawClient }),
            selector: go.codeblock("caller")
        });
    }

    private getReturnSignature({
        endpoint,
        signature
    }: {
        endpoint: HttpEndpoint;
        signature: EndpointSignatureInfo;
    }): go.Type[] {
        if (signature.returnType == null) {
            return [go.Type.error()];
        }
        if (this.context.isEnabledPaginationEndpoint(endpoint) && signature.pageReturnType != null) {
            return [signature.pageReturnType, go.Type.error()];
        }
        return [signature.returnType, go.Type.error()];
    }

    private getRawReturnSignature({ signature }: { signature: EndpointSignatureInfo }): go.Type[] {
        return [go.Type.pointer(go.Type.reference(signature.rawReturnTypeReference)), go.Type.error()];
    }

    private getRequestParameterName({ endpoint }: { endpoint: HttpEndpoint }): string {
        const requestParameterName = endpoint.sdkRequest?.requestParameterName;
        if (requestParameterName == null) {
            return "request";
        }
        return this.context.getParameterName(requestParameterName);
    }

    private getReceiverCodeBlock({
        subpackage,
        rawClient
    }: {
        subpackage?: Subpackage;
        rawClient?: boolean;
    }): go.AstNode {
        if (rawClient) {
            return go.codeblock(this.getRawClientReceiver());
        }
        return go.codeblock(this.getClientReceiver({ subpackage }));
    }

    private getClientReceiver({ subpackage }: { subpackage?: Subpackage }): string {
        if (subpackage == null) {
            return this.context.getRootClientReceiverName();
        }
        return "c";
    }

    private getRawClientReceiver(): string {
        return "r";
    }
}
