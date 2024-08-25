import { ProtobufFile } from "@fern-api/ir-sdk";
import { ResolvedSource } from "../resolvers/ResolvedSource";

export function convertProtobufFile({ source }: { source: ResolvedSource.Protobuf }): ProtobufFile {
    return {
        filepath: source.relativeFilePath,
        packageName: source.packageName,
        options:
            source.csharpNamespace != null
                ? {
                      csharp: {
                          namespace: source.csharpNamespace
                      }
                  }
                : undefined
    };
}
