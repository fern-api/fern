import { z } from "zod";
import { GitHubRepositoryOutputSchema } from "./GitHubRepositoryOutputSchema.js";
import { GitSelfHostedOutputSchema } from "./GitSelfHostedOutputSchema.js";

export const GitOutputSchema = z.union([GitSelfHostedOutputSchema, GitHubRepositoryOutputSchema]);

export type GitOutputSchema = z.infer<typeof GitOutputSchema>;

export function isGitOutputSelfHosted(git: GitOutputSchema): git is GitSelfHostedOutputSchema {
    return "uri" in git;
}

export function isGitOutputGitHubRepository(git: GitOutputSchema): git is GitHubRepositoryOutputSchema {
    return "repository" in git;
}
