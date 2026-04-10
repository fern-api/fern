import { z } from "zod";

export const GitSelfHostedOutputModeSchema = z.enum(["pr", "push"]);

export type GitSelfHostedOutputModeSchema = z.infer<typeof GitSelfHostedOutputModeSchema>;
