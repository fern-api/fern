import { write } from "fs";

import { assertNever } from "@fern-api/core-utils";
import { go } from "@fern-api/go-ast";

import { HttpEndpoint, HttpService, ServiceId, Subpackage } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../../SdkGeneratorContext";
import { AbstractEndpointGenerator } from "../AbstractEndpointGenerator";
import { EndpointSignatureInfo } from "../EndpointSignatureInfo";
import { EndpointRequest } from "../request/EndpointRequest";
import { getEndpointRequest } from "../utils/getEndpointRequest";

export declare namespace EndpointGenerator {
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
                    writer.write(
                        `headers.Add("${header.name.wireValue}", ${this.context.getLiteralAsString(literal)})`
                    );
                    continue;
                }
                // TODO: Handle optionals.
                // TOOD: Handle formatting.
            }
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

    private getRawClientReceiver(): string {
        return "r";
    }
}
