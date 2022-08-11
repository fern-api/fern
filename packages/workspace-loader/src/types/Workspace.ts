import { RelativeFilePath } from "@fern-api/config-management-commons";
import { GeneratorsConfiguration } from "@fern-api/generators-configuration";
import { FernConfigurationSchema } from "@fern-api/yaml-schema";

export interface Workspace {
    name: string;
    absolutePathToWorkspace: string;
    absolutePathToDefinition: string;
    generatorsConfiguration: GeneratorsConfiguration;
    rootApiFile: FernConfigurationSchema;
    serviceFiles: Record<RelativeFilePath, FernConfigurationSchema>;
}
