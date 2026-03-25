import { z } from "zod";

export const GeneratorImageObjectSchema = z.object({
    name: z.string(),
    registry: z.string()
});

export type GeneratorImageObjectSchema = z.infer<typeof GeneratorImageObjectSchema>;
