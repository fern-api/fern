import { z } from "zod";

export const GenerateConfigSchema = z.strictObject({
    enabled: z.literal(true),
    output: z.optional(z.string())
});

export type GenerateConfigSchema = z.infer<typeof GenerateConfigSchema>;
