import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/core-utils";
import { GeneratorsConfiguration } from "@fern-api/generators-configuration";
import { RootApiFileSchema, ServiceFileSchema } from "@fern-api/yaml-schema";

export interface Workspace {
    name: string;
    absolutePathToWorkspace: AbsoluteFilePath;
    absolutePathToDefinition: AbsoluteFilePath;
    generatorsConfiguration: GeneratorsConfiguration;
    rootApiFile: RootApiFileSchema;
    serviceFiles: Record<RelativeFilePath, ServiceFileSchema>;
}
