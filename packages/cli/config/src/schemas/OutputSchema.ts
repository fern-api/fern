import { z } from "zod";
import { GitOutputSchema } from "./GitOutputSchema.js";

const OutputObjectSchema = z.object({
    path: z.string().optional(),
    git: GitOutputSchema.optional()
});

/**
 * Output configuration for SDK targets.
 *
 * Supports a shorthand string syntax that is equivalent to `{ path: "<string>" }`:
 *
 * ```yaml
 * output: ./sdks/typescript
 * ```
 *
 * is equivalent to:
 *
 * ```yaml
 * output:
 *   path: ./sdks/typescript
 * ```
 */
export const OutputSchema = z.preprocess((val) => (typeof val === "string" ? { path: val } : val), OutputObjectSchema);

export type OutputSchema = z.infer<typeof OutputSchema>;
