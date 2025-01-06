import { z } from "zod";

import { GithubLicenseSchema } from "./GithubLicenseSchema";

export const GithubConfigurationSchema = z.strictObject({
    repository: z.string(),
    license: z.optional(GithubLicenseSchema),
    mode: z.optional(z.enum(["pull-request", "commit"]))
});

export type GithubConfigurationSchema = z.infer<typeof GithubConfigurationSchema>;
