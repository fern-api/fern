import { DependenciesConfiguration } from "@fern-api/dependencies-configuration";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { GeneratorsConfiguration } from "@fern-api/generators-configuration";
import { PackageMarkerFileSchema, RootApiFileSchema, ServiceFileSchema } from "@fern-api/yaml-schema";
import { ParsedFernFile } from "./FernFile";

export interface Workspace {
    name: string;
    absolutePathToWorkspace: AbsoluteFilePath;
    absolutePathToDefinition: AbsoluteFilePath;
    generatorsConfiguration: GeneratorsConfiguration;
    dependenciesConfiguration: DependenciesConfiguration;
    rootApiFile: ParsedFernFile<RootApiFileSchema>;
    serviceFiles: Record<RelativeFilePath, ParsedFernFile<ServiceFileSchema>>;
    importedServiceFiles: Record<RelativeFilePath, ParsedFernFile<ServiceFileSchema>>;
    packageMarkers: Record<RelativeFilePath, ParsedFernFile<PackageMarkerFileSchema>>;
}
