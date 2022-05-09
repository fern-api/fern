import { z } from "zod";

// IMPORTANT: don't use strictObject so we're forward compat if new keys are added

export const HelperLocationSchema = z.object({
    type: z.literal("npm"),
    packageName: z.string(),
    version: z.string(),
});

export type HelperLocationSchema = z.infer<typeof HelperLocationSchema>;
