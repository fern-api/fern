import type { AbsoluteFilePath, RelativeFilePath } from "@fern-api/path-utils";

import type { OpenAPISettings } from "./openapi/OpenAPISettings.js";
import type { Source } from "./Source.js";

export type Spec = OpenAPISpec | ProtobufSpec | OpenRPCSpec | GraphQLSpec;

export interface OpenAPISpec {
    type: "openapi";
    absoluteFilepath: AbsoluteFilePath;
    absoluteFilepathToOverrides: AbsoluteFilePath | AbsoluteFilePath[] | undefined;
    absoluteFilepathToOverlays: AbsoluteFilePath | undefined;
    source: Source;
    namespace?: string;
    settings?: OpenAPISettings;
}

export interface OpenRPCSpec {
    type: "openrpc";
    absoluteFilepath: AbsoluteFilePath;
    absoluteFilepathToOverrides: AbsoluteFilePath | AbsoluteFilePath[] | undefined;
    namespace?: string;
}

export interface ProtobufSpec {
    type: "protobuf";
    absoluteFilepathToProtobufRoot: AbsoluteFilePath;
    absoluteFilepathToProtobufTarget: AbsoluteFilePath | undefined;
    absoluteFilepathToOverrides: AbsoluteFilePath | AbsoluteFilePath[] | undefined;
    relativeFilepathToProtobufRoot: RelativeFilePath;
    generateLocally: boolean;
    fromOpenAPI: boolean;
    dependencies: string[];
    settings?: OpenAPISettings;
}

export interface GraphQLSpec {
    type: "graphql";
    absoluteFilepath: AbsoluteFilePath;
    absoluteFilepathToOverrides: AbsoluteFilePath | AbsoluteFilePath[] | undefined;
    namespace?: string;
}
