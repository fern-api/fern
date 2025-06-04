import { ParseOpenAPIOptions } from "@fern-api/openapi-ir-parser";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/path-utils";

import { Source } from "./Source";

export type Spec = OpenAPISpec | ProtobufSpec | OpenRPCSpec;

export interface OpenAPISpec {
    type: "openapi";
    absoluteFilepath: AbsoluteFilePath;
    absoluteFilepathToOverrides: AbsoluteFilePath | undefined;
    source: Source;
    namespace?: string;
    settings?: ParseOpenAPIOptions;
}

export interface OpenRPCSpec {
    type: "openrpc";
    absoluteFilepath: AbsoluteFilePath;
    absoluteFilepathToOverrides: AbsoluteFilePath | undefined;
    namespace?: string;
}

export interface ProtobufSpec {
    type: "protobuf";
    absoluteFilepathToProtobufRoot: AbsoluteFilePath;
    absoluteFilepathToProtobufTarget: AbsoluteFilePath;
    absoluteFilepathToOverrides: AbsoluteFilePath | undefined;
    relativeFilepathToProtobufRoot: RelativeFilePath;
    generateLocally: boolean;
    settings?: ParseOpenAPIOptions;
}
