import { AbsoluteFilePath } from "@fern-api/path-utils";

import { ProjectConfigSchema } from "./schema/ProjectConfigSchema.js";

export interface ProjectConfig {
    _absolutePath: AbsoluteFilePath;
    rawConfig: ProjectConfigSchema;
    organization: string;
    /**
     * The organization generated code takes its names from (client and error classes, user agents) when that is
     * not `organization`: a guest run generates under the session's `guest-<id>` organization but keeps the
     * fern.config.json organization here, so the SDK is not named after the throwaway org.
     */
    sdkOrganization?: string;
    version: string;
}
