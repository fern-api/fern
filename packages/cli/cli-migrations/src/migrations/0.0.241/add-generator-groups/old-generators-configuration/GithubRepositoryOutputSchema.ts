import { z } from "zod";

export const GithubRepositoryOutputSchema = z.strictObject({
    repository: z.string()
});

export type GithubRepositoryOutputSchema = z.infer<typeof GithubRepositoryOutputSchema>;
