import { z } from "zod";
import { GitOutputModeSchema } from "./GitOutputModeSchema";
import { LicenseSchema } from "./LicenseSchema";

export const GitOutputSchema = z.object({
    repository: z.string(),
    mode: GitOutputModeSchema.optional(),
    branch: z.string().optional(),
    license: LicenseSchema.optional()
});

export type GitOutputSchema = z.infer<typeof GitOutputSchema>;
