import { z } from "zod";

export const GithubRepositoryOutputSchema: z.ZodObject<
    { repository: z.ZodString },
    "strict",
    z.ZodTypeAny,
    { repository: string },
    { repository: string }
> = z.strictObject({
    repository: z.string()
});

export type GithubRepositoryOutputSchema = z.infer<typeof GithubRepositoryOutputSchema>;
