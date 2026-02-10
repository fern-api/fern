import { z } from "zod";
import { GitOutputModeSchema } from "./GitOutputModeSchema.js";
import { LicenseSchema } from "./LicenseSchema.js";
import { ReviewersSchema } from "./ReviewersSchema.js";

export const GitOutputSchema = z.object({
    repository: z.string(),
    mode: GitOutputModeSchema.optional(),
    branch: z.string().optional(),
    license: LicenseSchema.optional(),
    reviewers: ReviewersSchema.optional()
});

export type GitOutputSchema = z.infer<typeof GitOutputSchema>;
