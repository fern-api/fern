import semver from "semver";
import { z } from "zod";

export const PROJECT_CONFIG_VERSION_REQUIREMENT = 'an exact semver version (e.g. "1.2.3"), "*", or "latest"';

export function isValidProjectConfigVersion(version: string): boolean {
    return version === "*" || version === "latest" || semver.valid(version) === version;
}

export const ProjectConfigSchema = z.strictObject({
    organization: z.string(),
    version: z.string().refine(isValidProjectConfigVersion, {
        message: `Version must be ${PROJECT_CONFIG_VERSION_REQUIREMENT}`
    })
});

export type ProjectConfigSchema = z.infer<typeof ProjectConfigSchema>;
