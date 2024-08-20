import { csharp } from "@fern-api/csharp-codegen";
import { HttpEndpoint, ServiceId } from "@fern-fern/ir-sdk/api";
import { GrpcClientInfo } from "../grpc/GrpcClientInfo";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { GrpcEndpointGenerator } from "./grpc/GrpcEndpointGenerator";
import { HttpEndpointGenerator } from "./http/HttpEndpointGenerator";
import { RawClient } from "./http/RawClient";

export class EndpointGenerator {
    private http: HttpEndpointGenerator;
    private grpc: GrpcEndpointGenerator;

    public constructor({ context, rawClient }: { context: SdkGeneratorContext; rawClient: RawClient }) {
        this.http = new HttpEndpointGenerator({ context, rawClient });
        this.grpc = new GrpcEndpointGenerator({ context });
    }

    public generate({
        serviceId,
        endpoint,
        rawClientReference,
        rawGrpcClientReference,
        grpcClientInfo
    }: {
        serviceId: ServiceId;
        endpoint: HttpEndpoint;
        rawClientReference: string;
        rawGrpcClientReference: string;
        grpcClientInfo: GrpcClientInfo | undefined;
    }): csharp.Method {
        if (grpcClientInfo != null) {
            return this.grpc.generate({
                serviceId,
                endpoint,
                rawGrpcClientReference,
                grpcClientInfo
            });
        }
        return this.http.generate({
            serviceId,
            endpoint,
            rawClientReference
        });
    }
}
