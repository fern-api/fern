import { z } from "zod";

const OutputMetadataAuthorSchema = z.strictObject({
    name: z.string(),
    email: z.string()
});

export const OutputMetadataSchema = z.strictObject({
    description: z.optional(z.string()),
    authors: z.optional(z.array(OutputMetadataAuthorSchema))
});

export type OutputMetadataSchema = z.infer<typeof OutputMetadataSchema>;
