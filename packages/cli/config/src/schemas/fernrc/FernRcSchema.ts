import { z } from "zod";
import { FernRcAiSchema } from "./FernRcAiSchema.js";
import { FernRcAuthSchema } from "./FernRcAuthSchema.js";
import { FernRcCacheSchema } from "./FernRcCacheSchema.js";
import { FernRcTelemetrySchema } from "./FernRcTelemetrySchema.js";

export const FernRcSchema = z.object({
    /** Config file version for migrations */
    version: z.literal("v1").default("v1"),
    /** Authentication settings */
    auth: FernRcAuthSchema.default({ accounts: [] }),
    /** Cache settings */
    cache: FernRcCacheSchema.optional(),
    /** Telemetry settings */
    telemetry: FernRcTelemetrySchema.optional(),
    /** AI settings (e.g. API keys for AI-powered fix suggestions) */
    ai: FernRcAiSchema.optional()
});

export type FernRcSchema = z.infer<typeof FernRcSchema>;

/**
 * Creates an empty FernRc config with defaults.
 */
export function createEmptyFernRcSchema(): FernRcSchema {
    return {
        version: "v1",
        auth: {
            active: undefined,
            accounts: []
        }
    };
}
