import { z } from "zod";
import { GitSelfHostedOutputModeSchema } from "./GitSelfHostedOutputModeSchema.js";
import { LicenseSchema } from "./LicenseSchema.js";

export const GitSelfHostedOutputSchema = z
    .object({
        uri: z.string(),
        token: z.string(),
        mode: GitSelfHostedOutputModeSchema.optional(),
        branch: z.string().optional(),
        license: LicenseSchema.optional()
    })
    .strict();

export type GitSelfHostedOutputSchema = z.infer<typeof GitSelfHostedOutputSchema>;
