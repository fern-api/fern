import { z } from "zod";
import { GitHubRepositoryOutputModeSchema } from "./GitHubRepositoryOutputModeSchema.js";
import { LicenseSchema } from "./LicenseSchema.js";
import { ReviewersSchema } from "./ReviewersSchema.js";

export const GitHubRepositoryOutputSchema = z
    .object({
        repository: z.string(),
        mode: GitHubRepositoryOutputModeSchema.optional(),
        branch: z.string().optional(),
        license: LicenseSchema.optional(),
        reviewers: ReviewersSchema.optional()
    })
    .strict();

export type GitHubRepositoryOutputSchema = z.infer<typeof GitHubRepositoryOutputSchema>;
