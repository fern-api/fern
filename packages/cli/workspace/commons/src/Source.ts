import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/path-utils"

export type Source = AsyncAPISource | OpenAPISource | ProtobufSource

export interface AsyncAPISource {
    type: "asyncapi"
    relativePathToDependency?: RelativeFilePath
    file: AbsoluteFilePath
}

export interface OpenAPISource {
    type: "openapi"
    relativePathToDependency?: RelativeFilePath
    file: AbsoluteFilePath
}

export interface ProtobufSource {
    type: "protobuf"
    relativePathToDependency?: RelativeFilePath
    root: AbsoluteFilePath
    file: AbsoluteFilePath
}

export interface IdentifiableSource {
    type: "asyncapi" | "openapi" | "protobuf"
    id: string
    absoluteFilePath: AbsoluteFilePath
}
