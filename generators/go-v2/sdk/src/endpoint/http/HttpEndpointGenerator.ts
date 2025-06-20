import { write } from "fs";

import { assertNever } from "@fern-api/core-utils";
import { go } from "@fern-api/go-ast";

import {
    HttpEndpoint,
    HttpRequestBody,
    HttpService,
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

export declare namespace EndpointGenerator {
    const OCTET_STREAM_CONTENT_TYPE = "application/octet-stream";

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
        const endpointRequest = getEndpointRequest({ context: this.context, endpoint, serviceId, service });
        return [this.generateRawUnaryEndpoint({ serviceId, service, endpoint, subpackage, endpointRequest })];
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
            return_: this.getReturnSignature({ signature }),
            body: this.getRawUnaryEndpointBody({ signature, endpoint, endpointRequest }),
            typeReference: this.getRawClientTypeReference({ subpackage })
        });
    }

    private getReturnSignature({ signature }: { signature: EndpointSignatureInfo }): go.Type[] {
        if (signature.returnType == null) {
            return [go.Type.error()];
        }
        return [signature.returnType, go.Type.error()];
    }

    private getRawClientTypeReference({ subpackage }: { subpackage: Subpackage | undefined }): go.TypeReference {
        if (subpackage == null) {
            return this.context.getRootRawClientClassReference();
        }
        return this.context.getSubpackageRawClientClassReference(subpackage);
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
            writer.writeNode(this.buildRequestOptions());
            writer.newLine();
            writer.writeNode(this.buildBaseUrl({ endpoint }));
            writer.newLine();
            writer.writeNode(this.buildEndpointUrl({ endpoint }));

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
        });
    }

    private buildRequestOptions(): go.CodeBlock {
        return go.codeblock((writer) => {
            writer.write("options := ");
            writer.writeNode(this.context.callNewRequestOptions(go.codeblock("opts...")));
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

    private buildEndpointUrl({ endpoint }: { endpoint: HttpEndpoint }): go.CodeBlock {
        return go.codeblock((writer) => {
            writer.write("endpointURL := baseURL");
            const pathSuffix = this.getPathSuffix({ endpoint });
            if (pathSuffix !== "") {
                writer.write(` + "/${pathSuffix}"`);
            }
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
            writer.write("if err != nil {");
            writer.indent();
            writer.writeNode(this.writeReturnZeroValueWithError({ zeroValue: signature.returnZeroValue }));
            writer.dedent();
            writer.write("}");
            for (const queryParameter of endpoint.queryParameters) {
                const literal = this.context.maybeLiteral(queryParameter.valueType);
                if (literal != null) {
                    writer.write(
                        `queryParams.Add("${queryParameter.name}", ${this.context.getLiteralAsString(literal)})`
                    );
                    continue;
                }
            }
            writer.write("if len(queryParams) > 0 {");
            writer.indent();
            writer.write(`endpointURL += "?" + queryParams.Encode()`);
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
            if (endpoint.headers.length > 0) {
                writer.newLine();
            }
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
                            importPath: this.context.getLocationForTypeId(errorDeclaration.name.errorId).importPath
                        });
                        return {
                            name: errorDeclaration.statusCode.toString(),
                            value: go.TypeInstantiation.reference(
                                go.func({
                                    parameters: [
                                        go.parameter({
                                            name: "apiError",
                                            type: go.Type.reference(this.context.getCoreApiErrorTypeReference())
                                        })
                                    ],
                                    return_: [go.Type.reference(errorTypeReference)],
                                    body: go.codeblock((writer) => {
                                        writer.write("return ");
                                        writer.writeNode(
                                            go.TypeInstantiation.structPointer({
                                                typeReference: this.context.getCoreApiErrorTypeReference(),
                                                fields: [
                                                    {
                                                        name: "APIError",
                                                        value: go.TypeInstantiation.reference(go.codeblock("apiError"))
                                                    }
                                                ]
                                            })
                                        );
                                    })
                                })
                            )
                        };
                    })
                })
            );
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
                return justRequestBody.contentType ?? EndpointGenerator.OCTET_STREAM_CONTENT_TYPE;
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
                return requestBody.contentType ?? EndpointGenerator.OCTET_STREAM_CONTENT_TYPE;
            case "fileUpload":
            case "inlinedRequestBody":
            case "reference":
                return requestBody.contentType;
            default:
                assertNever(requestBody);
        }
    }

    private addHeaderValue({ wireValue, value }: { wireValue: string; value: go.AstNode }): go.CodeBlock {
        return go.codeblock(`headers.Add("${wireValue}", fmt.Sprintf("%v", ${value}))`);
    }

    private setHeaderValue({ wireValue, value }: { wireValue: string; value: string }): go.CodeBlock {
        return go.codeblock(`headers.Add("${wireValue}", "${value}")`);
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

    private writeReturnZeroValue({ zeroValue }: { zeroValue?: go.TypeInstantiation }): go.CodeBlock {
        return go.codeblock((writer) => {
            writer.write(`return `);
            if (zeroValue != null) {
                writer.writeNode(zeroValue);
                writer.write(", ");
            }
            writer.write("nil");
        });
    }

    private getRawClientReceiverCodeBlock(): go.AstNode {
        return go.codeblock(this.getRawClientReceiver());
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
