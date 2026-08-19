import { z } from "zod";

export const GitSelfHostedOutputModeSchema = z.enum(["pr", "push", "release"]);

export type GitSelfHostedOutputModeSchema = z.infer<typeof GitSelfHostedOutputModeSchema>;
