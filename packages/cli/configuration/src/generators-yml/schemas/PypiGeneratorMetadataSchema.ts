import { z } from "zod";
import { GeneratorMetadataSchema } from "./GeneratorMetadataSchema";

export const PypiGeneratorMetadataSchema = GeneratorMetadataSchema.extend({
    keywords: z.optional(z.array(z.string())),
    documentationLink: z.optional(z.string()),
    homepageLink: z.optional(z.string())
});

export type PypiGeneratorMetadataSchema = z.infer<typeof PypiGeneratorMetadataSchema>;
