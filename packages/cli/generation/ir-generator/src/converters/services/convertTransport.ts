import { Transport } from "@fern-api/ir-sdk";
import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFileContext } from "../../FernFileContext";
import { SourceResolver } from "../../resolvers/SourceResolver";
import { convertProtobufService } from "./convertProtobufService";

export async function convertTransport({
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
    if (resolvedSource.type !== "protobuf") {
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
