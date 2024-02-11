import { z } from "zod";
import { WhitelabelGithubConfigurationSchema } from "./WhitelabelGithubConfigurationSchema";

export const WhitelabelConfigurationSchema = z.strictObject({
    github: z.optional(WhitelabelGithubConfigurationSchema)
});

export type WhitelabelConfigurationSchema = z.infer<typeof WhitelabelConfigurationSchema>;
