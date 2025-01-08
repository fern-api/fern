import { RawSchemas, isRawProtobufSourceSchema } from "@fern-api/fern-definition-schema";
import { Transport } from "@fern-api/ir-sdk";
import { SourceResolver } from "@fern-api/source-resolver";

import { FernFileContext } from "../../FernFileContext";
import { convertProtobufService } from "./convertProtobufService";

export function getTransportForService({
    file,
    serviceDeclaration,
    sourceResolver
}: {
    file: FernFileContext;
    serviceDeclaration: RawSchemas.HttpServiceSchema;
    sourceResolver: SourceResolver;
}): Transport {
    if (!isRawProtobufSourceSchema(serviceDeclaration.source)) {
        // anything not protobuf is http
        return Transport.http();
    }
    return createProtobufService(
        file,
        serviceDeclaration.source,
        sourceResolver,
        serviceDeclaration.transport?.grpc?.["service-name"]
    );
}

export function getTransportForEndpoint({
    file,
    serviceTransport,
    endpointDeclaration,
    sourceResolver
}: {
    file: FernFileContext;
    serviceTransport: Transport;
    endpointDeclaration: RawSchemas.HttpEndpointSchema;
    sourceResolver: SourceResolver;
}): Transport | undefined {
    const isGrpcService = serviceTransport.type === "grpc";
    const isHttpService = serviceTransport.type === "http";
    const isGrpcEndpoint = isRawProtobufSourceSchema(endpointDeclaration.source);
    const isHttpEndpoint = !isGrpcEndpoint;
    if (!isGrpcService) {
        // no need to override the transport if the service is not grpc
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
            return createProtobufService(file, protoSource, sourceResolver, serviceNameOverride);
        }
    }

    throw new Error(
        `Internal error; failed to determine endpoint transport for\n  ${JSON.stringify(endpointDeclaration)}"`
    );
}

function createProtobufService(
    file: FernFileContext,
    source: RawSchemas.ProtobufSourceSchema,
    sourceResolver: SourceResolver,
    serviceNameOverride: string | undefined
) {
    const resolvedSource = sourceResolver.resolveSourceOrThrow({
        source,
        relativeFilepath: file.relativeFilepath
    });
    if (resolvedSource == null || resolvedSource.type !== "protobuf") {
        throw new Error(`Expected a protobuf source for ${source.proto}.`);
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
