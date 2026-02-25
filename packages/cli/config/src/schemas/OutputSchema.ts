import { z } from "zod";
import { GitOutputSchema } from "./GitOutputSchema.js";

export const OutputObjectSchema = z.object({
    path: z.string().optional(),
    git: GitOutputSchema.optional()
});

export type OutputObjectSchema = z.infer<typeof OutputObjectSchema>;

export const OutputSchema = z.union([z.string(), OutputObjectSchema]);

export type OutputSchema = z.infer<typeof OutputSchema>;

/**
 * Normalizes an OutputSchema value to its object form.
 * If the output is a string, it is treated as `{ path: string }`.
 */
export function resolveOutput(output: OutputSchema): OutputObjectSchema {
    if (typeof output === "string") {
        return { path: output };
    }
    return output;
}
