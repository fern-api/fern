import { FernConfigurationSchema } from "@fern-api/yaml-schema";
import { RelativeFilePath } from "./RelativeFilePath";

export interface Workspace {
    name: string | undefined;
    files: Record<RelativeFilePath, FernConfigurationSchema>;
}
