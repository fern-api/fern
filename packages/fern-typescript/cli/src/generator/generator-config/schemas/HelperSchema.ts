import { z } from "zod";

// IMPORTANT: don't use strictObject so we're forward compat if new keys are added

export const HelperSchema = z.object({
    name: z.string(),
    version: z.string(),
    absolutePath: z.string(),
});

export type HelperSchema = z.infer<typeof HelperSchema>;
