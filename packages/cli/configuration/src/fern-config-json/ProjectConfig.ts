import { AbsoluteFilePath } from "@fern-api/path-utils";

import { ProjectConfigSchema } from "./schema/ProjectConfigSchema";

export interface ProjectConfig {
    _absolutePath: AbsoluteFilePath;
    rawConfig: ProjectConfigSchema;
    organization: string;
    version: string;
}
