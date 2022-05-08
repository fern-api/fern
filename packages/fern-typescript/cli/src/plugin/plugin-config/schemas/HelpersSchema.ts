import { z } from "zod";

// IMPORTANT: don't use strictObject so we're forward compat if new keys are added

export const HelpersSchema = z.object({
    encodings: z.record(z.string()),
});

export type HelpersSchema = z.infer<typeof HelpersSchema>;
