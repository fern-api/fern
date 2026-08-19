import type { OutputObjectSchema } from "./OutputObjectSchema.js";
import type { OutputSchema } from "./OutputSchema.js";

/**
 * Normalizes an OutputSchema value to its object form.
 * If the output is a string, it is treated as `{ path: string }`.
 */
export function resolveOutputObjectSchema(output: OutputSchema): OutputObjectSchema {
    if (typeof output === "string") {
        return { path: output };
    }
    return output;
}
