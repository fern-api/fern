import { DependenciesConfiguration } from "@fern-api/dependencies-configuration";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { GeneratorsConfiguration } from "@fern-api/generators-configuration";
import { DefinitionFileSchema, PackageMarkerFileSchema, RootApiFileSchema } from "@fern-api/yaml-schema";
import { ParsedFernFile } from "./FernFile";

export type Workspace = FernWorkspace | OpenAPIWorkspace;

export interface OpenAPIWorkspace {
    type: "openapi";
    name: string;
    absolutePathToWorkspace: AbsoluteFilePath;
    absolutePathToDefinition: AbsoluteFilePath;
    generatorsConfiguration: GeneratorsConfiguration;
    definition: OpenAPIDefinition;
}

export interface OpenAPIDefinition {
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
    absolutePathToWorkspace: AbsoluteFilePath;
    absolutePathToDefinition: AbsoluteFilePath;
    generatorsConfiguration: GeneratorsConfiguration;
    dependenciesConfiguration: DependenciesConfiguration;
    definition: FernDefinition;
}

export interface FernDefinition {
    rootApiFile: ParsedFernFile<RootApiFileSchema>;
    namedDefinitionFiles: Record<RelativeFilePath, OnDiskNamedDefinitionFile>;
    packageMarkers: Record<RelativeFilePath, ParsedFernFile<PackageMarkerFileSchema>>;
    importedDefinitions: Record<RelativeFilePath, FernDefinition>;
}

export interface OnDiskNamedDefinitionFile extends ParsedFernFile<DefinitionFileSchema> {
    absoluteFilepath: AbsoluteFilePath;
}
