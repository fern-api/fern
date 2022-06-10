import { z } from "zod";
import { HelperSchema } from "./HelperSchema";

// IMPORTANT: don't use strictObject so we're forward compat if new keys are added

export const HelpersSchema = z.object({
    encodings: z.record(HelperSchema),
});

export type HelpersSchema = z.infer<typeof HelpersSchema>;
