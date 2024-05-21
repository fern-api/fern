import { z } from "zod";
import { OutputMetadataSchema } from "./OutputMetadataSchema";

export const PypiOutputMetadataSchema = OutputMetadataSchema.extend({
    keywords: z.optional(z.array(z.string())),
    documentationLink: z.optional(z.string()),
    homepageLink: z.optional(z.string())
});

export type PypiOutputMetadataSchema = z.infer<typeof PypiOutputMetadataSchema>;
