import { z } from "zod";
import { GithubCommitAndReleaseSchema } from "./GithubCommitAndReleaseSchema";
import { GithubPullRequestSchema } from "./GithubPullRequestSchema";
import { GithubPushSchema } from "./GithubPushSchema";

export const GithubConfigurationSchema = z.union([
    GithubCommitAndReleaseSchema,
    GithubPullRequestSchema,
    GithubPushSchema
]);

export type GithubConfigurationSchema = z.infer<typeof GithubConfigurationSchema>;
