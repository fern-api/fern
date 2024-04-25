import { z } from "zod";

// Common per-generator configuration flags
export type BaseGeneratorConfigSchema = z.infer<typeof BaseGeneratorConfigSchema>;

export const BaseGeneratorConfigSchema = z.strictObject({
    extraDependencies: z.optional(z.record(z.string())),
    clientClassName: z.optional(z.string())
});
