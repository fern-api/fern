import { AbsoluteFilePath } from "@fern-api/path-utils";
import { Source } from "./Source";
import { SpecImportSettings } from "@fern-api/openapi-ir-parser";

export type Spec = OpenAPISpec | ProtobufSpec;

export interface OpenAPISpec {
    type: "openapi";
    absoluteFilepath: AbsoluteFilePath;
    absoluteFilepathToOverrides: AbsoluteFilePath | undefined;
    source: Source;
    namespace?: string;
    settings?: SpecImportSettings;
}

export interface ProtobufSpec {
    type: "protobuf";
    absoluteFilepathToProtobufRoot: AbsoluteFilePath;
    absoluteFilepathToProtobufTarget: AbsoluteFilePath;
    absoluteFilepathToOverrides: AbsoluteFilePath | undefined;
    generateLocally: boolean;
    settings?: SpecImportSettings;
}
