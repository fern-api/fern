import { z } from "zod";

export const GithubConfigurationSchema: z.ZodObject<
    { repository: z.ZodString },
    "strict",
    z.ZodTypeAny,
    { repository: string },
    { repository: string }
> = z.strictObject({
    repository: z.string()
});

export type GithubConfigurationSchema = z.infer<typeof GithubConfigurationSchema>;
