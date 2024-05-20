import { z } from "zod";

const GeneratorMetadataAuthorSchema = z.strictObject({
    name: z.string(),
    email: z.string()
});

export const GeneratorMetadataSchema = z.strictObject({
    description: z.optional(z.string()),
    authors: z.optional(z.array(GeneratorMetadataAuthorSchema))
});

export type GeneratorMetadataSchema = z.infer<typeof GeneratorMetadataSchema>;
