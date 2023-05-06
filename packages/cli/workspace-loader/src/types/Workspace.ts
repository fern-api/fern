import { DependenciesConfiguration } from "@fern-api/dependencies-configuration";
import { DocsConfiguration } from "@fern-api/docs-configuration";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { GeneratorsConfiguration } from "@fern-api/generators-configuration";
import { DefinitionFileSchema, PackageMarkerFileSchema, RootApiFileSchema } from "@fern-api/yaml-schema";
import { ParsedFernFile } from "./FernFile";

export type Workspace = FernWorkspace | OpenAPIWorkspace;

export interface OpenAPIWorkspace {
    type: "openapi";
    name: string;
    absoluteFilepath: AbsoluteFilePath;
    generatorsConfiguration: GeneratorsConfiguration;
    docsDefinition: DocsDefinition | undefined;
    definition: OpenAPIDefinition;
}

export interface OpenAPIDefinition {
    absolutePath: AbsoluteFilePath;
    file: OpenAPIFile | undefined;
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
    absoluteFilepath: AbsoluteFilePath;
    generatorsConfiguration: GeneratorsConfiguration;
    dependenciesConfiguration: DependenciesConfiguration;
    definition: FernDefinition;
    docsDefinition: DocsDefinition | undefined;
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
