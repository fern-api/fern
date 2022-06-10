import { z } from "zod";

// IMPORTANT: don't use strictObject so we're forward compat if new keys are added

export const GeneratorOutputConfigSchema = z.object({
    path: z.string(),
    pathRelativeToRootOnHost: z.string().nullable(),
});

export type GeneratorOutputConfigSchema = z.infer<typeof GeneratorOutputConfigSchema>;
