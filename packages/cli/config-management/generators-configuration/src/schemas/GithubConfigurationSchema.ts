import { z } from "zod";
import { GithubCommitSchema } from "./GithubCommitSchema";
import { GithubPullRequestSchema } from "./GithubPullRequestSchema";

export const GithubConfigurationSchema = z.union([GithubCommitSchema, GithubPullRequestSchema]);

export type GithubConfigurationSchema = z.infer<typeof GithubConfigurationSchema>;
