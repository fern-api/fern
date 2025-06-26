import { assertNever } from "@fern-api/core-utils";
import { go } from "@fern-api/go-ast";

import {
    HttpEndpoint,
    HttpRequestBody,
    HttpResponseBody,
    HttpService,
    JsonResponse,
    SdkRequestBodyType,
    SdkRequestWrapper,
    ServiceId,
    StreamingResponse,
    Subpackage
} from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { AbstractEndpointGenerator } from "../AbstractEndpointGenerator";
import { EndpointSignatureInfo } from "../EndpointSignatureInfo";
import { EndpointRequest } from "../request/EndpointRequest";
import { getEndpointRequest } from "../utils/getEndpointRequest";

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
    }): go.Method[] {
        const methods: go.Method[] = [];
        return methods;
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
    }): go.Method[] {
        if (!this.shouldGenerateRawEndpoint({ endpoint })) {
            return [];
        }
        const endpointRequest = getEndpointRequest({ context: this.context, endpoint, serviceId, service });
        return [this.generateRawUnaryEndpoint({ serviceId, service, endpoint, subpackage, endpointRequest })];
    }

    private shouldGenerateRawEndpoint({ endpoint }: { endpoint: HttpEndpoint }): boolean {
        return (
            !this.context.isFileUploadEndpoint(endpoint) &&
            !this.context.isPaginationEndpoint(endpoint) &&
            !this.context.isStreamingEndpoint(endpoint)
        );
    }

    private generateRawUnaryEndpoint({
        serviceId,
        service,
        endpoint,
        subpackage,
        endpointRequest
    }: {
        serviceId: ServiceId;
        service: HttpService;
        endpoint: HttpEndpoint;
        subpackage: Subpackage | undefined;
        endpointRequest: EndpointRequest | undefined;
    }): go.Method {
        const signature = this.getEndpointSignatureInfo({ serviceId, service, endpoint });
        return new go.Method({
            name: this.context.getMethodName(endpoint.name),
            parameters: signature.allParameters,
            return_: this.getRawReturnSignature({ signature }),
            body: this.getRawUnaryEndpointBody({ signature, endpoint, endpointRequest }),
            typeReference: this.getRawClientTypeReference({ service, subpackage }),
            pointerReceiver: true
        });
    }

    private getRawReturnSignature({ signature }: { signature: EndpointSignatureInfo }): go.Type[] {
        return [go.Type.pointer(go.Type.reference(signature.rawReturnTypeReference)), go.Type.error()];
    }

    private getRawClientTypeReference({
        service,
        subpackage
    }: {
        service: HttpService;
        subpackage: Subpackage | undefined;
    }): go.TypeReference {
        if (subpackage == null) {
            return this.context.getRootRawClientClassReference();
        }
        return this.context.getRawClientClassReference({ service, subpackage });
    }

    private getRawUnaryEndpointBody({
        signature,
        endpoint,
        endpointRequest
    }: {
        signature: EndpointSignatureInfo;
        endpoint: HttpEndpoint;
        endpointRequest: EndpointRequest | undefined;
    }): go.CodeBlock {
        return go.codeblock((writer) => {
            writer.writeNode(this.buildRequestOptions({ endpoint }));
            writer.newLine();
            writer.writeNode(this.buildBaseUrl({ endpoint }));
            writer.newLine();
            writer.writeNode(this.buildEndpointUrl({ endpoint, signature }));

            const buildQueryParameters = this.buildQueryParameters({ signature, endpoint, endpointRequest });
            if (buildQueryParameters != null) {
                writer.newLine();
                writer.writeNode(buildQueryParameters);
            }

            const buildHeaders = this.buildHeaders({ endpoint });
            writer.newLine();
            writer.writeNode(buildHeaders);

            const buildErrorDecoder = this.buildErrorDecoder({ endpoint });
            if (buildErrorDecoder != null) {
                writer.newLine();
                writer.writeNode(buildErrorDecoder);
            }

            const responseInitialization = this.getResponseInitialization({ endpoint });
            if (responseInitialization != null) {
                writer.newLine();
                writer.writeNode(responseInitialization);
            }

            writer.newLine();
            writer.write("raw, err := ");
            writer.writeNode(
                this.context.caller.call({
                    endpoint,
                    clientReference: this.getCallerFieldReference(),
                    optionsReference: go.codeblock("options"),
                    url: go.codeblock("endpointURL"),
                    request: endpointRequest?.getRequestReference(),
                    response: this.getResponseParameterReference({ endpoint }),
                    errorCodes: buildErrorDecoder != null ? go.codeblock("errorCodes") : undefined
                })
            );
            writer.newLine();
            writer.writeLine("if err != nil {");
            writer.indent();
            writer.writeNode(this.writeRawReturnZeroValueWithError());
            writer.newLine();
            writer.dedent();
            writer.writeLine("}");

            writer.writeNode(this.getRawResponseReturnStatement({ endpoint, signature }));
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

    private buildBaseUrl({ endpoint }: { endpoint: HttpEndpoint }): go.CodeBlock {
        return go.codeblock((writer) => {
            writer.write("baseURL := ");
            writer.writeNode(
                this.context.callResolveBaseURL([
                    go.selector({
                        on: go.codeblock("options"),
                        selector: go.codeblock("BaseURL")
                    }),
                    go.selector({
                        on: this.getRawClientReceiverCodeBlock(),
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

    private buildQueryParameters({
        signature,
        endpoint,
        endpointRequest
    }: {
        signature: EndpointSignatureInfo;
        endpoint: HttpEndpoint;
        endpointRequest: EndpointRequest | undefined;
    }): go.CodeBlock | undefined {
        if (endpointRequest == null || endpoint.queryParameters.length === 0) {
            return undefined;
        }
        return go.codeblock((writer) => {
            writer.write("queryParams, err := ");
            writer.writeNode(this.context.callQueryValues([go.codeblock(endpointRequest.getRequestParameterName())]));
            writer.newLine();
            writer.writeLine("if err != nil {");
            writer.indent();
            writer.writeNode(this.writeRawReturnZeroValueWithError());
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
            writer.writeLine("if len(queryParams) > 0 {");
            writer.indent();
            writer.writeLine(`endpointURL += "?" + queryParams.Encode()`);
            writer.dedent();
            writer.write("}");
        });
    }

    private buildHeaders({ endpoint }: { endpoint: HttpEndpoint }): go.CodeBlock {
        return go.codeblock((writer) => {
            writer.write("headers := ");
            writer.writeNode(
                this.context.callMergeHeaders([
                    go.codeblock(`${this.getRawClientReceiver()}.header.Clone()`),
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
                const headerField = go.codeblock(
                    `${this.getRequestParameterName({ endpoint })}.${this.context.getFieldName(header.name.name)}`
                );
                const format = this.context.goValueFormatter.convert({
                    reference: header.valueType,
                    value: headerField
                });
                if (format.isOptional) {
                    writer.write(`if ${headerField} != nil {`);
                    writer.indent();
                    writer.writeNode(
                        this.addHeaderValue({ wireValue: header.name.wireValue, value: format.formatted })
                    );
                    writer.dedent();
                    writer.write("}");
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
        if (responseBody == null) {
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
                // TODO: Implement stream responses.
                return undefined;
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
                        context: this.context,
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
                return go.codeblock("response");
            case "text":
                return go.codeblock("response.String()");
            case "streaming":
            case "streamParameter":
                // TODO: Implement stream responses.
                return go.codeblock("nil");
            default:
                assertNever(responseBody);
        }
    }

    private getResponseBodyReferenceForJson({ jsonResponse }: { jsonResponse: JsonResponse }): go.CodeBlock {
        switch (jsonResponse.type) {
            case "response":
                return go.codeblock("response");
            case "nestedPropertyAsResponse":
                const responseProperty = jsonResponse.responseProperty;
                if (responseProperty == null) {
                    return go.codeblock("response");
                }
                return go.codeblock(`response.${this.context.getFieldName(responseProperty.name.name)}`);
            default:
                assertNever(jsonResponse);
        }
    }

    private wrapWithRawResponseType({
        context,
        rawReturnTypeReference,
        responseBodyReference
    }: {
        context: SdkGeneratorContext;
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
                return this.getContentTypeHeaderValueForWrapper({ wrapper: sdkRequest.shape, requestBody });
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

    private getContentTypeHeaderValueForWrapper({
        wrapper,
        requestBody
    }: {
        wrapper: SdkRequestWrapper;
        requestBody: HttpRequestBody;
    }): string | undefined {
        switch (requestBody.type) {
            case "bytes":
                return requestBody.contentType ?? HttpEndpointGenerator.OCTET_STREAM_CONTENT_TYPE;
            case "fileUpload":
            case "inlinedRequestBody":
            case "reference":
                return requestBody.contentType;
            default:
                assertNever(requestBody);
        }
    }

    private addHeaderValue({ wireValue, value }: { wireValue: string; value: go.AstNode }): go.CodeBlock {
        return go.codeblock((writer) => {
            writer.newLine();
            writer.write(`headers.Add("${wireValue}", `);
            writer.writeNode(this.context.callSprintf([go.codeblock(`"%v"`), value]));
            writer.write(")");
        });
    }

    private addQueryValue({ wireValue, value }: { wireValue: string; value: string }): go.CodeBlock {
        return go.codeblock((writer) => {
            writer.newLine();
            writer.write(`queryParams.Add("${wireValue}", "${value}")`);
        });
    }

    private setHeaderValue({ wireValue, value }: { wireValue: string; value: string }): go.CodeBlock {
        return go.codeblock((writer) => {
            writer.newLine();
            writer.write(`headers.Add("${wireValue}", "${value}")`);
        });
    }

    private writeRawReturnZeroValueWithError(): go.CodeBlock {
        return go.codeblock("return nil, err");
    }

    private writeReturnZeroValueWithError({ zeroValue }: { zeroValue?: go.TypeInstantiation }): go.CodeBlock {
        return go.codeblock((writer) => {
            writer.write(`return `);
            if (zeroValue != null) {
                writer.writeNode(zeroValue);
                writer.write(", ");
            }
            writer.write("err");
        });
    }

    private getRawClientReceiverCodeBlock(): go.AstNode {
        return go.codeblock(this.getRawClientReceiver());
    }

    private getCallerFieldReference(): go.AstNode {
        return go.selector({
            on: this.getRawClientReceiverCodeBlock(),
            selector: go.codeblock("caller")
        });
    }

    private getRequestParameterName({ endpoint }: { endpoint: HttpEndpoint }): string {
        const requestParameterName = endpoint.sdkRequest?.requestParameterName;
        if (requestParameterName == null) {
            return "request";
        }
        return this.context.getParameterName(requestParameterName);
    }

    private getRawClientReceiver(): string {
        return "r";
    }
}
