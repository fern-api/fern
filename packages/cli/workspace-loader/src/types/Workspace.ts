import { docsYml, generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { DefinitionFileSchema, PackageMarkerFileSchema, RootApiFileSchema } from "@fern-api/yaml-schema";
import { processPackageMarkers } from "../processPackageMarkers";
import { FernWorkspace, LazyFernWorkspace } from "../workspaces/FernWorkspace";
import { OSSWorkspace } from "../workspaces/OSSWorkspace";
import { ParsedFernFile } from "./FernFile";

export type Workspace = DocsWorkspace | LazyFernWorkspace | OSSWorkspace;

export interface DocsWorkspace {
    type: "docs";
    workspaceName: string | undefined;
    absoluteFilepath: AbsoluteFilePath; // path to the fern folder (dirname(absoluteFilepathToDocsConfig))
    absoluteFilepathToDocsConfig: AbsoluteFilePath;
    config: docsYml.RawSchemas.DocsConfiguration;
}

export type Spec = OpenAPISpec | ProtobufSpec;

export interface OpenAPISpec {
    type: "openapi";
    absoluteFilepath: AbsoluteFilePath;
    absoluteFilepathToOverrides: AbsoluteFilePath | undefined;
    source: Source;
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

export type Source = AsyncAPISource | OpenAPISource | ProtobufSource;

export interface AsyncAPISource {
    type: "asyncapi";
    file: AbsoluteFilePath;
}

export interface OpenAPISource {
    type: "openapi";
    file: AbsoluteFilePath;
}

export interface ProtobufSource {
    type: "protobuf";
    file: AbsoluteFilePath;
}

export interface SpecImportSettings {
    audiences: string[];
    shouldUseTitleAsName: boolean;
    shouldUseUndiscriminatedUnionsWithLiterals: boolean;
}

export interface APIChangelog {
    files: ChangelogFile[];
}

export interface ChangelogFile {
    absoluteFilepath: AbsoluteFilePath;
    contents: string;
}

export interface OpenAPIFile {
    absoluteFilepath: AbsoluteFilePath;
    contents: string;
}

export interface AsyncAPIFile {
    absoluteFilepath: AbsoluteFilePath;
    contents: string;
}

export interface FernDefinition {
    absoluteFilepath: AbsoluteFilePath;
    rootApiFile: ParsedFernFile<RootApiFileSchema>;
    namedDefinitionFiles: Record<RelativeFilePath, OnDiskNamedDefinitionFile>;
    packageMarkers: Record<RelativeFilePath, ParsedFernFile<PackageMarkerFileSchema>>;
    importedDefinitions: Record<RelativeFilePath, processPackageMarkers.ImportedDefinition>;
}

export interface OnDiskNamedDefinitionFile extends ParsedFernFile<DefinitionFileSchema> {
    absoluteFilepath: AbsoluteFilePath;
}

export interface FernWorkspaceMetadata {
    workspace: FernWorkspace;
    absolutePathToPreview: AbsoluteFilePath | undefined;
    group: generatorsYml.GeneratorGroup;
}
