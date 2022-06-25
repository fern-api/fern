import { z } from "zod";

// IMPORTANT: don't use strictObject so we're forward compat if new keys are added

export const GeneratorOutputConfigSchema = z.object({
    path: z.string(),
});

export type GeneratorOutputConfigSchema = z.infer<typeof GeneratorOutputConfigSchema>;
