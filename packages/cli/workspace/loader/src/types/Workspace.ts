import { docsYml, generatorsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { AbstractAPIWorkspace, FernWorkspace } from "@fern-api/api-workspace-commons";
import { SpecImportSettings } from "@fern-api/openapi-ir-parser";

export type Workspace = DocsWorkspace | AbstractAPIWorkspace<unknown>;

export interface DocsWorkspace {
    type: "docs";
    workspaceName: string | undefined;
    absoluteFilePath: AbsoluteFilePath; // path to the fern folder (dirname(absoluteFilepathToDocsConfig))
    absoluteFilepathToDocsConfig: AbsoluteFilePath;
    config: docsYml.RawSchemas.DocsConfiguration;
}

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

export interface IdentifiableSource {
    type: "asyncapi" | "openapi" | "protobuf";
    id: string;
    absoluteFilePath: AbsoluteFilePath;
}

export type Source = AsyncAPISource | OpenAPISource | ProtobufSource;

export interface AsyncAPISource {
    type: "asyncapi";
    relativePathToDependency?: RelativeFilePath;
    file: AbsoluteFilePath;
}

export interface OpenAPISource {
    type: "openapi";
    relativePathToDependency?: RelativeFilePath;
    file: AbsoluteFilePath;
}

export interface ProtobufSource {
    type: "protobuf";
    relativePathToDependency?: RelativeFilePath;
    root: AbsoluteFilePath;
    file: AbsoluteFilePath;
}

export interface OpenAPIFile {
    absoluteFilepath: AbsoluteFilePath;
    contents: string;
}

export interface AsyncAPIFile {
    absoluteFilepath: AbsoluteFilePath;
    contents: string;
}

export interface FernWorkspaceMetadata {
    workspace: FernWorkspace;
    absolutePathToPreview: AbsoluteFilePath | undefined;
    group: generatorsYml.GeneratorGroup;
}
