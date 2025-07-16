import { z } from "zod";

export const GithubConfigurationSchema = z.strictObject({
    repository: z.string()
});

export type GithubConfigurationSchema = z.infer<typeof GithubConfigurationSchema>;
