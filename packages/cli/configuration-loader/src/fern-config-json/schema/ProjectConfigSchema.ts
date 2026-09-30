import semver from "semver";
import { z } from "zod";

export const ProjectConfigSchema = z.strictObject({
    organization: z.string(),
    version: z
        .string()
        .refine((version) => version === "*" || version === "latest" || semver.valid(version) === version, {
            message: 'Version must be an exact semver version (e.g. "1.2.3"), "*", or "latest"'
        })
});

export type ProjectConfigSchema = z.infer<typeof ProjectConfigSchema>;
