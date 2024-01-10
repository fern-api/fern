import { z } from "zod";

// Common per-generator configuration flags
export interface BaseGeneratorConfig {
    clientClassName: string;
    noOptionalProperties: boolean;
    extraDependencies: Record<string, string>;
    defaultTimeoutInSeconds: number | "infinity" | undefined;
}

export const BaseGeneratorConfigSchema = z.strictObject({
    noOptionalProperties: z.optional(z.string()),
    defaultTimeoutInSeconds: z.optional(z.union([z.literal("infinity"), z.number()])),
    extraDependencies: z.optional(z.record(z.string())),
    clientClassName: z.optional(z.string()),
});

