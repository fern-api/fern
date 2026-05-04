import { z } from "zod";

export const GeneratorImageObjectSchema = z.object({
    name: z.string(),
    registry: z.string()
});

export type GeneratorImageObjectSchema = z.infer<typeof GeneratorImageObjectSchema>;

/** String = image name override. Object = image name + custom registry. */
export const GeneratorImageSchema = z.union([z.string(), GeneratorImageObjectSchema]);

export type GeneratorImageSchema = z.infer<typeof GeneratorImageSchema>;
