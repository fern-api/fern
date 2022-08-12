import { RelativeFilePath } from "@fern-api/config-management-commons";
import { GeneratorsConfiguration } from "@fern-api/generators-configuration";
import { RootApiFileSchema, ServiceFileSchema } from "@fern-api/yaml-schema";

export interface Workspace {
    name: string;
    absolutePathToWorkspace: string;
    absolutePathToDefinition: string;
    generatorsConfiguration: GeneratorsConfiguration;
    rootApiFile: RootApiFileSchema;
    serviceFiles: Record<RelativeFilePath, ServiceFileSchema>;
}
