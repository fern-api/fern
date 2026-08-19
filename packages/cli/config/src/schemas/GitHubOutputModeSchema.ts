import { z } from "zod";

export const GitHubOutputModeSchema = z.enum(["pr", "release", "push"]);

export type GitHubOutputModeSchema = z.infer<typeof GitHubOutputModeSchema>;
