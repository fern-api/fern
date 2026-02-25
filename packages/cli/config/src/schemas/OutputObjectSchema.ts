import { z } from "zod";
import { GitOutputSchema } from "./GitOutputSchema.js";

export const OutputObjectSchema = z.object({
    path: z.string().optional(),
    git: GitOutputSchema.optional()
});

export type OutputObjectSchema = z.infer<typeof OutputObjectSchema>;
