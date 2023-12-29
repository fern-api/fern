import { z } from "zod";
import { GithubLicenseSchema } from "./GithubLicenseSchema";

export const GithubPullRequestSchema = z.strictObject({
    repository: z.string(),
    branch: z.optional(z.string()),
    license: z.optional(GithubLicenseSchema),
    mode: z.optional(z.literal("pull-request"))
});

export type GithubPullRequestSchema = z.infer<typeof GithubPullRequestSchema>;
