import { dependenciesYml, docsYml, generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { DefinitionFileSchema, PackageMarkerFileSchema, RootApiFileSchema } from "@fern-api/yaml-schema";
import { ParsedFernFile } from "./FernFile";

export type Workspace = DocsWorkspace | APIWorkspace;

export interface DocsWorkspace {
    type: "docs";
    workspaceName: string | undefined;
    absoluteFilepath: AbsoluteFilePath; // path to the fern folder (dirname(absoluteFilepathToDocsConfig))
    absoluteFilepathToDocsConfig: AbsoluteFilePath;
    config: docsYml.RawSchemas.DocsConfiguration;
}

export type APIWorkspace = FernWorkspace | OSSWorkspace;

/**
 * An OSS workspace is a workspace that contains an OpenAPI or AsyncAPI document.
 */
export interface OSSWorkspace {
    type: "oss";
    absoluteFilepath: AbsoluteFilePath;
    workspaceName: string | undefined;
    name: string;
    specs: Spec[];
    changelog: APIChangelog | undefined;
    generatorsConfiguration: generatorsYml.GeneratorsConfiguration | undefined;
}

export interface Spec {
    absoluteFilepath: AbsoluteFilePath;
    absoluteFilepathToOverrides: AbsoluteFilePath | undefined;
    settings?: SpecImportSettings;
}

export interface SpecImportSettings {
    audiences: string[];
    shouldUseTitleAsName: boolean;
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

export interface FernWorkspace {
    type: "fern";
    name: string;
    workspaceName: string | undefined;
    absoluteFilepath: AbsoluteFilePath;
    generatorsConfiguration: generatorsYml.GeneratorsConfiguration | undefined;
    dependenciesConfiguration: dependenciesYml.DependenciesConfiguration;
    definition: FernDefinition;
    changelog: APIChangelog | undefined;
}

export interface FernDefinition {
    absoluteFilepath: AbsoluteFilePath;
    rootApiFile: ParsedFernFile<RootApiFileSchema>;
    namedDefinitionFiles: Record<RelativeFilePath, OnDiskNamedDefinitionFile>;
    packageMarkers: Record<RelativeFilePath, ParsedFernFile<PackageMarkerFileSchema>>;
    importedDefinitions: Record<RelativeFilePath, FernDefinition>;
}

export interface OnDiskNamedDefinitionFile extends ParsedFernFile<DefinitionFileSchema> {
    absoluteFilepath: AbsoluteFilePath;
}
