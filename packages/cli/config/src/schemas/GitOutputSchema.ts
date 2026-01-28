import { z } from "zod";

export const GitModeSchema = z.enum(["pr", "release", "push"]);

export type GitModeSchema = z.infer<typeof GitModeSchema>;

export const GitOutputSchema = z.object({
    repository: z.string(),
    mode: GitModeSchema.optional(),
    branch: z.string().optional()
});

export type GitOutputSchema = z.infer<typeof GitOutputSchema>;
