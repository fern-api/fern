import { Transport } from "@fern-api/ir-sdk";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { FernFileContext } from "../../FernFileContext";
import { SourceResolver } from "../../resolvers/SourceResolver";
import { convertProtobufService } from "./convertProtobufService";

export async function getTransportForService({
    file,
    serviceDeclaration,
    sourceResolver
}: {
    file: FernFileContext;
    serviceDeclaration: RawSchemas.HttpServiceSchema;
    sourceResolver: SourceResolver;
}): Promise<Transport> {
    if (serviceDeclaration.source == null) {
        return Transport.http();
    }
    const resolvedSource = await sourceResolver.resolveSourceOrThrow({
        source: serviceDeclaration.source,
        file
    });
    if (resolvedSource == null || resolvedSource.type !== "protobuf") {
        return Transport.http();
    }
    const protobufService = convertProtobufService({
        source: resolvedSource,
        serviceNameOverride: serviceDeclaration.transport?.grpc?.["service-name"]
    });
    if (protobufService == null) {
        throw new Error(`Failed to resolve service name from ${resolvedSource.relativeFilePath}.`);
    }
    return Transport.grpc({
        service: protobufService
    });
}

export async function getTransportForEndpoint({
    file,
    serviceTransport,
    endpointDeclaration,
    sourceResolver
}: {
    file: FernFileContext;
    serviceTransport: Transport;
    endpointDeclaration: RawSchemas.HttpEndpointSchema;
    sourceResolver: SourceResolver;
}): Promise<Transport | undefined> {
    const isGrpcService = serviceTransport.type === "grpc";
    const isHttpService = serviceTransport.type === "http";
    const isGrpcEndpoint = endpointDeclaration.source !== undefined && "proto" in endpointDeclaration.source;
    const isHttpEndpoint = !isGrpcEndpoint;
    if (isHttpService && isHttpEndpoint) {
        // if the service is http, the endpoint should inherit the service transport
        return undefined;
    }
    if (isHttpService && isGrpcEndpoint) {
        throw new Error("Cannot have a grpc endpoint on an http service");
    }
    if (isGrpcService && isHttpEndpoint) {
        // if the service is grpc, but the endpoint is http, the endpoint should override the service transport
        return Transport.http();
    }
    if (isGrpcService && isGrpcEndpoint) {
        const protoSource = endpointDeclaration.source as RawSchemas.ProtobufSourceSchema;
        const serviceNameOverride = endpointDeclaration.transport?.grpc?.["service-name"];
        if (!serviceNameOverride) {
            // if there's no config specifically for the endpoint, we'll return undefined to inherit the service's transport
            return undefined;
        } else {
            const resolvedSource = await sourceResolver.resolveSourceOrThrow({
                source: protoSource,
                file
            });
            if (resolvedSource == null || resolvedSource.type !== "protobuf") {
                throw new Error(`Expected a protobuf source for ${protoSource.proto}.`);
            }
            const protobufService = convertProtobufService({
                source: resolvedSource,
                serviceNameOverride
            });
            if (protobufService == null) {
                throw new Error(`Failed to resolve service name from ${resolvedSource.relativeFilePath}.`);
            }
            return Transport.grpc({
                service: protobufService
            });
        }
    } else {
        throw new Error("This should never happen");
    }
}
