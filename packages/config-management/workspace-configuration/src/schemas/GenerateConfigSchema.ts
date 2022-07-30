import { z } from "zod";

export const GenerateConfigSchema = z.strictObject({
    enabled: z.literal(true),
    output: z.string().optional(),
});

export type GenerateConfigSchema = z.infer<typeof GenerateConfigSchema>;
