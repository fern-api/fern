import { z } from "zod";
import { OutputMetadataSchema } from "./OutputMetadataSchema";

export const PypiOutputMetadataSchema = OutputMetadataSchema.extend({
    keywords: z.optional(z.array(z.string())),
    "documentation-link": z.optional(z.string()),
    "homepage-link": z.optional(z.string())
});

export type PypiOutputMetadataSchema = z.infer<typeof PypiOutputMetadataSchema>;
