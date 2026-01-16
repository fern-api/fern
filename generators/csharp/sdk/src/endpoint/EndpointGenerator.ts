import { GrpcClientInfo } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { HttpEndpoint, ServiceId } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { AbstractEndpointGenerator } from "./AbstractEndpointGenerator";
import { GrpcEndpointGenerator } from "./grpc/GrpcEndpointGenerator";
import { HttpEndpointGenerator } from "./http/HttpEndpointGenerator";
import { RawClient } from "./http/RawClient";
import { getEndpointReturnType } from "./utils/getEndpointReturnType";

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
            endpoint
        }: {
            serviceId: ServiceId;
            endpoint: HttpEndpoint;
        }
    ): void {
        if (this.hasPagination(endpoint)) {
            this.generatePagerInterfaceSignature(interface_, { serviceId, endpoint });
            if (endpoint.pagination.type !== "custom") {
                this.generateUnpagedInterfaceSignature(interface_, { serviceId, endpoint, isPrivate: true });
            }
        } else {
            this.generateUnpagedInterfaceSignature(interface_, { serviceId, endpoint, isPrivate: false });
        }
    }

    private generateUnpagedInterfaceSignature(
        interface_: ast.Interface,
        {
            serviceId,
            endpoint,
            isPrivate
        }: {
            serviceId: ServiceId;
            endpoint: HttpEndpoint;
            isPrivate: boolean;
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
        parameters.push(this.getRequestOptionsParameter({ endpoint }));
        parameters.push(
            this.csharp.parameter({
                type: this.System.Threading.CancellationToken,
                name: this.names.parameters.cancellationToken,
                initializer: "default"
            })
        );
        const rawReturn = getEndpointReturnType({ context: this.context, endpoint });

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

        // Wrap return type in Task<T> for interface methods, EXCEPT for streaming endpoints
        // which use async iterators that return IAsyncEnumerable<T> directly
        let return_: ast.Type;
        if (isStreaming) {
            // Streaming endpoints return IAsyncEnumerable<T> directly (async iterator pattern)
            return_ = rawReturn ?? this.System.Threading.Tasks.Task();
        } else {
            // Regular async methods return Task<T>
            return_ =
                rawReturn != null ? this.System.Threading.Tasks.Task(rawReturn) : this.System.Threading.Tasks.Task();
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
            endpoint
        }: {
            serviceId: ServiceId;
            endpoint: HttpEndpoint;
        }
    ): void {
        const endpointSignatureInfo = this.getEndpointSignatureInfo({
            serviceId,
            endpoint
        });
        const parameters = [...endpointSignatureInfo.baseParameters];
        parameters.push(this.getRequestOptionsParameter({ endpoint }));
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

    private getRequestOptionsParameter({ endpoint }: { endpoint: HttpEndpoint }): ast.Parameter {
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

    public generateRaw(
        cls: ast.Class,
        {
            serviceId,
            endpoint,
            rawClientReference,
            rawClient
        }: {
            serviceId: ServiceId;
            endpoint: HttpEndpoint;
            rawClientReference: string;
            rawClient: RawClient;
        }
    ) {
        return this.http.generateRaw(cls, {
            serviceId,
            endpoint,
            rawClientReference,
            rawClient
        });
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
