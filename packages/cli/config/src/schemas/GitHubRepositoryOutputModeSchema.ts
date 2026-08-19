import { z } from "zod";

export const GitHubRepositoryOutputModeSchema = z.enum(["pr", "release", "push"]);

export type GitHubRepositoryOutputModeSchema = z.infer<typeof GitHubRepositoryOutputModeSchema>;
