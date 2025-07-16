import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/path-utils"

export declare type ResolvedSource = ResolvedSource.OpenAPI | ResolvedSource.Protobuf

export declare namespace ResolvedSource {
    interface OpenAPI {
        type: "openapi"
        absoluteFilePath: AbsoluteFilePath
        relativeFilePath: RelativeFilePath
    }

    interface Protobuf {
        type: "protobuf"
        absoluteFilePath: AbsoluteFilePath
        relativeFilePath: RelativeFilePath
        csharpNamespace: string | undefined
        packageName: string | undefined
        serviceName: string | undefined
    }
}
