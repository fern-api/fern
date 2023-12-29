import { z } from "zod";
import { GithubLicenseSchema } from "./GithubLicenseSchema";

export const GithubCommitSchema = z.strictObject({
    repository: z.string(),
    license: z.optional(GithubLicenseSchema),
    mode: z.optional(z.literal("commit"))
});

export type GithubCommitSchema = z.infer<typeof GithubCommitSchema>;
