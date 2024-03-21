import { z } from "zod";

export const GeneratorPublishMetadataSchema = z.strictObject({
    "package-description": z.optional(z.string()),
    "publisher-email": z.optional(z.string()),
    "reference-url": z.optional(z.string()),
    "publisher-name": z.optional(z.string())
});

export type GeneratorPublishMetadataSchema = z.infer<typeof GeneratorPublishMetadataSchema>;
