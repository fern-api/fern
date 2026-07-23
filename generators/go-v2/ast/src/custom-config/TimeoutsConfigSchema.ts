import { z } from "zod";

/**
 * Optional, additive per-phase HTTP timeouts (in seconds; fractional values
 * allowed). When set, the generated SDK builds a default *http.Client backed by
 * a custom transport that applies these timeouts, unless the user supplies their
 * own HTTP client. When unset, generated output is byte-identical to before.
 */
export const timeoutsConfigSchema = z.strictObject({
    connect: z.number().min(0).optional(),
    read: z.number().min(0).optional(),
    write: z.number().min(0).optional()
});

export type TimeoutsConfigSchema = z.infer<typeof timeoutsConfigSchema>;
