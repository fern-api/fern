import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { GeneratorsConfiguration } from "@fern-api/generators-configuration";
import { RootApiFileSchema, ServiceFileSchema } from "@fern-api/yaml-schema";
import { DependenciesConfiguration } from "../loadDependencies";

export interface Workspace {
    name: string;
    absolutePathToWorkspace: AbsoluteFilePath;
    absolutePathToDefinition: AbsoluteFilePath;
    generatorsConfiguration: GeneratorsConfiguration;
    rootApiFile: RootApiFileSchema;
    serviceFiles: Record<RelativeFilePath, ServiceFileSchema>;
    dependencies: DependenciesConfiguration;
}
