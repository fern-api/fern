import { z } from "zod";

export const GithubConfigurationSchema = z.strictObject({
    repository: z.string(),
    mode: z.optional(z.enum(["pull-request", "commit"])),
});

export type GithubConfigurationSchema = z.infer<typeof GithubConfigurationSchema>;
