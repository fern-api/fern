import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { ProjectConfigSchema } from "./schema/ProjectConfigSchema";

export interface ProjectConfig {
    _absolutePath: AbsoluteFilePath;
    rawConfig: ProjectConfigSchema;
    organization: string;
    version: string;
}
