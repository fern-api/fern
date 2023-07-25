import { DependenciesConfiguration } from "@fern-api/dependencies-configuration";
import { DocsConfiguration } from "@fern-api/docs-configuration";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { GeneratorsConfiguration } from "@fern-api/generators-configuration";
import { DefinitionFileSchema, PackageMarkerFileSchema, RootApiFileSchema } from "@fern-api/yaml-schema";
import { ParsedFernFile } from "./FernFile";

export type Workspace = DocsWorkspace | APIWorkspace;

export interface DocsWorkspace {
    type: "docs";
    workspaceName: string | undefined;
    absoluteFilepath: AbsoluteFilePath;
    docsDefinition: DocsDefinition;
}

export type APIWorkspace = FernWorkspace | OpenAPIWorkspace;

export interface OpenAPIWorkspace {
    type: "openapi";
    workspaceName: string | undefined;
    name: string;
    absoluteFilepath: AbsoluteFilePath;
    generatorsConfiguration: GeneratorsConfiguration;
    definition: OpenAPIDefinition;
}

export interface OpenAPIDefinition {
    absolutePath: AbsoluteFilePath;
    file: OpenAPIFile;
    subDirectories: OpenAPIDefinition[];
}

export interface OpenAPIFile {
    absoluteFilepath: AbsoluteFilePath;
    /* relative filepath from the root of the definition */
    relativeFilepath: RelativeFilePath;
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

export interface DocsDefinition {
    absoluteFilepath: AbsoluteFilePath;
    config: DocsConfiguration;
    pages: Record<RelativeFilePath, string>;
}
