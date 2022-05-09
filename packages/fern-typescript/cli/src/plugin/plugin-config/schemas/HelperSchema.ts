import { z } from "zod";
import { HelperLocationSchema } from "./HelperLocationSchema";

// IMPORTANT: don't use strictObject so we're forward compat if new keys are added

export const HelperSchema = z.object({
    name: z.string(),
    version: z.string(),
    location: HelperLocationSchema,
});

export type HelperSchema = z.infer<typeof HelperSchema>;
