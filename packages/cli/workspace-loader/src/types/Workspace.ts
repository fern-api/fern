import { DependenciesConfiguration } from "@fern-api/dependencies-configuration";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { GeneratorsConfiguration } from "@fern-api/generators-configuration";
import { DefinitionFileSchema, PackageMarkerFileSchema, RootApiFileSchema } from "@fern-api/yaml-schema";
import { DocsConfiguration } from "@fern-fern/docs-config/api";
import { ParsedFernFile } from "./FernFile";

export type Workspace = DocsWorkspace | APIWorkspace;

export interface DocsWorkspace {
    type: "docs";
    workspaceName: string | undefined;
    absoluteFilepath: AbsoluteFilePath;
    absoluteFilepathToDocsConfig: AbsoluteFilePath;
    config: DocsConfiguration;
}

export type APIWorkspace = FernWorkspace | OpenAPIWorkspace;

export interface OpenAPIWorkspace {
    type: "openapi";
    workspaceName: string | undefined;
    name: string;
    absoluteFilepath: AbsoluteFilePath;
    generatorsConfiguration: GeneratorsConfiguration;
    absolutePathToOpenAPI: AbsoluteFilePath;
    absolutePathToAsyncAPI: AbsoluteFilePath | undefined;
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
    generatorsConfiguration: GeneratorsConfiguration;
    dependenciesConfiguration: DependenciesConfiguration;
    definition: FernDefinition;
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
