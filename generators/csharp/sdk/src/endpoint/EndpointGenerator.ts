import { ast, GrpcClientInfo } from "@fern-api/csharp-codegen";
import { HttpEndpoint, ServiceId } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { AbstractEndpointGenerator } from "./AbstractEndpointGenerator";
import { GrpcEndpointGenerator } from "./grpc/GrpcEndpointGenerator";
import { HttpEndpointGenerator } from "./http/HttpEndpointGenerator";
import { RawClient } from "./http/RawClient";

export class EndpointGenerator extends AbstractEndpointGenerator {
    private http: HttpEndpointGenerator;
    private grpc: GrpcEndpointGenerator;

    public constructor({ context }: { context: SdkGeneratorContext }) {
        super({ context });
        this.http = new HttpEndpointGenerator({ context });
        this.grpc = new GrpcEndpointGenerator({ context });
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
