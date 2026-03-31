import { AbsoluteFilePath } from "@fern-api/path-utils";

import { ProjectConfigSchema } from "./schema/ProjectConfigSchema.js";

export interface ProjectConfig {
    _absolutePath: AbsoluteFilePath;
    rawConfig: ProjectConfigSchema;
    organization: string;
    version: string;
}
