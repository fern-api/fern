import { RelativeFilePath } from "@fern-api/config-management-commons";
import { FernConfigurationSchema } from "@fern-api/yaml-schema";

export interface Workspace {
    name: string | undefined;
    absolutePath: string;
    files: Record<RelativeFilePath, FernConfigurationSchema>;
}
