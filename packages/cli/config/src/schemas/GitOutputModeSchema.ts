import { z } from "zod";

export const GitOutputModeSchema = z.enum(["pr", "release", "push"]);

export type GitOutputModeSchema = z.infer<typeof GitOutputModeSchema>;
