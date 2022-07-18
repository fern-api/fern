import { FernConfigurationSchema } from "@fern-api/yaml-schema";
import { RelativeFilePath } from "./RelativeFilePath";

export interface Workspace {
    name: string | undefined;
    absolutePath: string;
    files: Record<RelativeFilePath, FernConfigurationSchema>;
}
