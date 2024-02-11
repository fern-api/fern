import { z } from "zod";

export const WhitelabelGithubConfigurationSchema = z.strictObject({
    username: z.string(),
    email: z.string(),
    token: z.string()
});

export type WhitelabelGithubConfigurationSchema = z.infer<typeof WhitelabelGithubConfigurationSchema>;
