import { z } from "zod";
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
    telemetry: FernRcTelemetrySchema.optional()
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
