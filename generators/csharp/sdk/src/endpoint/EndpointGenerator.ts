import { assertNever } from "@fern-api/core-utils";
import { GrpcClientInfo } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

type HttpEndpoint = FernIr.HttpEndpoint;
type ServiceId = FernIr.ServiceId;

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";
import { AbstractEndpointGenerator } from "./AbstractEndpointGenerator.js";
import { GrpcEndpointGenerator } from "./grpc/GrpcEndpointGenerator.js";
import { HttpEndpointGenerator } from "./http/HttpEndpointGenerator.js";
import { RawClient } from "./http/RawClient.js";
import { getEndpointReturnType } from "./utils/getEndpointReturnType.js";

export class EndpointGenerator extends AbstractEndpointGenerator {
    private http: HttpEndpointGenerator;
    private grpc: GrpcEndpointGenerator;

    public constructor({ context }: { context: SdkGeneratorContext }) {
        super({ context });
        this.http = new HttpEndpointGenerator({ context });
        this.grpc = new GrpcEndpointGenerator({ context });
    }

    public generateInterfaceSignature(
        interface_: ast.Interface,
        {
            serviceId,
            endpoint,
            grpcClientInfo
        }: {
            serviceId: ServiceId;
            endpoint: HttpEndpoint;
            grpcClientInfo?: GrpcClientInfo;
        }
    ): void {
        if (this.hasPagination(endpoint)) {
            switch (endpoint.pagination.type) {
                case "offset":
                case "cursor":
                    this.generatePagerInterfaceSignature(interface_, { serviceId, endpoint, grpcClientInfo });
                    this.generateUnpagedInterfaceSignature(interface_, {
                        serviceId,
                        endpoint,
                        isPrivate: true,
                        grpcClientInfo
                    });
                    break;
                case "custom":
                    this.generatePagerInterfaceSignature(interface_, { serviceId, endpoint, grpcClientInfo });
                    break;
                case "uri":
                case "path":
                    this.context.logger.warn(
                        `Skipping endpoint '${endpoint.name.originalName}': '${endpoint.pagination.type}' pagination is not yet supported in C#.`
                    );
                    return;
                default:
                    assertNever(endpoint.pagination);
            }
        } else {
            this.generateUnpagedInterfaceSignature(interface_, {
                serviceId,
                endpoint,
                isPrivate: false,
                grpcClientInfo
            });
        }
    }

    private generateUnpagedInterfaceSignature(
        interface_: ast.Interface,
        {
            serviceId,
            endpoint,
            isPrivate,
            grpcClientInfo
        }: {
            serviceId: ServiceId;
            endpoint: HttpEndpoint;
            isPrivate: boolean;
            grpcClientInfo?: GrpcClientInfo;
        }
    ): void {
        if (isPrivate) {
            return;
        }
        const endpointSignatureInfo = this.getUnpagedEndpointSignatureInfo({
            serviceId,
            endpoint
        });
        const parameters = [...endpointSignatureInfo.baseParameters];
        parameters.push(this.getRequestOptionsParameter({ endpoint, grpcClientInfo }));
        parameters.push(
            this.csharp.parameter({
                type: this.System.Threading.CancellationToken,
                name: this.names.parameters.cancellationToken,
                initializer: "default"
            })
        );
        const isGrpc = this.isGrpcEndpoint(grpcClientInfo, endpoint);
        const rawReturn = getEndpointReturnType({ context: this.context, endpoint, isGrpc });

        // Check if this is a streaming endpoint (returns IAsyncEnumerable<T>)
        // Streaming endpoints use async iterators which return IAsyncEnumerable<T> directly, not Task<IAsyncEnumerable<T>>
        const isStreaming =
            endpoint.response?.body?._visit({
                streaming: () => true,
                json: () => false,
                fileDownload: () => false,
                text: () => false,
                bytes: () => false,
                streamParameter: () => true,
                _other: () => false
            }) ?? false;

        // Check if rawReturn is WithRawResponseTask<T>
        const isWithRawResponseTask =
            rawReturn != null && "name" in rawReturn && rawReturn.name === "WithRawResponseTask";

        // For interface methods:
        // - Streaming endpoints return IAsyncEnumerable<T> directly (async iterator pattern)
        // - WithRawResponseTask<T> is already task-like, don't wrap in Task<>
        // - gRPC endpoints return Task<T> (no raw response support)
        // - Empty responses return Task
        let return_: ast.Type;
        if (isStreaming) {
            // Streaming endpoints return IAsyncEnumerable<T> directly
            return_ = rawReturn ?? this.System.Threading.Tasks.Task();
        } else if (isWithRawResponseTask) {
            // WithRawResponseTask<T> is already task-like, use it directly
            return_ = rawReturn;
        } else if (rawReturn != null) {
            // gRPC and other non-streaming endpoints: wrap in Task<T>
            return_ = this.System.Threading.Tasks.Task(rawReturn);
        } else {
            // Empty responses return Task
            return_ = this.System.Threading.Tasks.Task();
        }

        interface_.addMethod({
            name: this.context.getEndpointMethodName(endpoint),
            parameters,
            summary: endpoint.docs,
            return_,
            noBody: true
        });
    }

    private generatePagerInterfaceSignature(
        interface_: ast.Interface,
        {
            serviceId,
            endpoint,
            grpcClientInfo
        }: {
            serviceId: ServiceId;
            endpoint: HttpEndpoint;
            grpcClientInfo?: GrpcClientInfo;
        }
    ): void {
        const endpointSignatureInfo = this.getEndpointSignatureInfo({
            serviceId,
            endpoint
        });
        const parameters = [...endpointSignatureInfo.baseParameters];
        parameters.push(this.getRequestOptionsParameter({ endpoint, grpcClientInfo }));
        parameters.push(
            this.csharp.parameter({
                type: this.System.Threading.CancellationToken,
                name: this.names.parameters.cancellationToken,
                initializer: "default"
            })
        );
        // Wrap pager return type in Task<T> to match the concrete class's async method signature
        const rawReturn = this.getPagerReturnType(endpoint);
        const return_ = this.System.Threading.Tasks.Task(rawReturn);

        interface_.addMethod({
            name: this.context.getEndpointMethodName(endpoint),
            parameters,
            summary: endpoint.docs,
            return_,
            noBody: true
        });
    }

    private getRequestOptionsParameter({
        endpoint,
        grpcClientInfo
    }: {
        endpoint: HttpEndpoint;
        grpcClientInfo?: GrpcClientInfo;
    }): ast.Parameter {
        const isGrpc = this.isGrpcEndpoint(grpcClientInfo, endpoint);
        if (isGrpc) {
            return this.csharp.parameter({
                type: this.Types.GrpcRequestOptions.asOptional(),
                name: this.names.parameters.requestOptions,
                initializer: "null"
            });
        }
        const isIdempotent = endpoint.idempotent;
        // Use concrete RequestOptions/IdempotentRequestOptions classes (public) instead of interfaces (internal)
        // to ensure interface methods have consistent accessibility
        const requestOptionsType = isIdempotent ? this.Types.IdempotentRequestOptions : this.Types.RequestOptions;
        const name = isIdempotent ? this.names.parameters.idempotentOptions : this.names.parameters.requestOptions;
        return this.csharp.parameter({
            type: requestOptionsType.asOptional(),
            name,
            initializer: "null"
        });
    }

    public generate(
        cls: ast.Class,
        {
            serviceId,
            endpoint,
            rawClientReference,
            rawGrpcClientReference,
            rawClient,
            grpcClientInfo
        }: {
            serviceId: ServiceId;
            endpoint: HttpEndpoint;
            rawClientReference: string;
            rawGrpcClientReference: string;
            rawClient: RawClient;
            grpcClientInfo: GrpcClientInfo | undefined;
        }
    ) {
        if (this.isGrpcEndpoint(grpcClientInfo, endpoint)) {
            this.grpc.generate(cls, {
                serviceId,
                endpoint,
                rawGrpcClientReference,
                grpcClientInfo
            });
        } else {
            return this.http.generate(cls, {
                serviceId,
                endpoint,
                rawClientReference,
                rawClient
            });
        }
    }

    private isGrpcEndpoint(
        grpcClientInfo: GrpcClientInfo | undefined,
        endpoint: HttpEndpoint
    ): grpcClientInfo is GrpcClientInfo {
        // If the service is a grpc service, grpcClientInfo will not be null or undefined,
        // so any endpoint will be generated as a grpc endpoint, unless the transport is overridden by setting type to http
        return grpcClientInfo != null && endpoint.transport?.type !== "http";
    }
}
