import { z } from "zod";
import { GithubLicenseSchema } from "./GithubLicenseSchema";
import { ReviewersSchema, REVIEWERS_KEY } from "./ReviewersSchema";

export const GithubPullRequestSchema = z.strictObject({
    repository: z.string(),
    branch: z.optional(z.string()),
    license: z.optional(GithubLicenseSchema),
    mode: z.literal("pull-request"),
    [REVIEWERS_KEY]: z.optional(ReviewersSchema)
});

export type GithubPullRequestSchema = z.infer<typeof GithubPullRequestSchema>;
