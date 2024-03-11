import { z } from "zod";
import { GithubLicenseSchema } from "./GithubLicenseSchema";

export const GithubCommitAndReleaseSchema = z.strictObject({
    repository: z.string(),
    license: z.optional(GithubLicenseSchema),
    mode: z.optional(z.enum(["commit", "release"]))
});

export type GithubCommitAndReleaseSchema = z.infer<typeof GithubCommitAndReleaseSchema>;
