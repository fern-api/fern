import { z } from "zod";

export const GeneratorImageObjectSchema = z.object({
    name: z.string(),
    registry: z.string().optional()
});

export type GeneratorImageObjectSchema = z.infer<typeof GeneratorImageObjectSchema>;

export const GeneratorImageSchema = z.union([z.string(), GeneratorImageObjectSchema]);

export type GeneratorImageSchema = z.infer<typeof GeneratorImageSchema>;
