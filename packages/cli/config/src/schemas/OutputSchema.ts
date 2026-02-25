import { z } from "zod";
import { GitOutputSchema } from "./GitOutputSchema.js";

const OutputObjectSchema = z.object({
    path: z.string().optional(),
    git: GitOutputSchema.optional()
});

export const OutputSchema = z.preprocess((val) => (typeof val === "string" ? { path: val } : val), OutputObjectSchema);

export type OutputSchema = z.infer<typeof OutputSchema>;
