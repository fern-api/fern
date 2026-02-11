import { z } from "zod";

export const GitOutputModeSchema: z.ZodEnum<{ pr: "pr"; release: "release"; push: "push" }> = z.enum([
    "pr",
    "release",
    "push"
]);

export type GitOutputModeSchema = z.infer<typeof GitOutputModeSchema>;
