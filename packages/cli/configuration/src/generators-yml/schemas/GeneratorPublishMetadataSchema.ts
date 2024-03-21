import { z } from "zod";

export const GeneratorPublishMetadataSchema = z.strictObject({
    "package-description": z.optional(z.string()),
    email: z.optional(z.string()),
    "reference-url": z.optional(z.string()),
    author: z.optional(z.string())
});

export type GeneratorPublishMetadataSchema = z.infer<typeof GeneratorPublishMetadataSchema>;
