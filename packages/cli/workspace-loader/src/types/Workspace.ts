import { DependenciesConfiguration } from "@fern-api/dependencies-configuration";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { GeneratorsConfiguration } from "@fern-api/generators-configuration";
import { PackageMarkerFileSchema, RootApiFileSchema, ServiceFileSchema } from "@fern-api/yaml-schema";
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
    path: RelativeFilePath;
    contents: string;
    format: "json" | "yaml";
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
    serviceFiles: Record<RelativeFilePath, OnDiskServiceFile>;
    packageMarkers: Record<RelativeFilePath, ParsedFernFile<PackageMarkerFileSchema>>;
    importedDefinitions: Record<RelativeFilePath, FernDefinition>;
}

export interface OnDiskServiceFile extends ParsedFernFile<ServiceFileSchema> {
    absoluteFilepath: AbsoluteFilePath;
}
