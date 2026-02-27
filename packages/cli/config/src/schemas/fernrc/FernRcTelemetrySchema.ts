import { z } from "zod";

export const FernRcTelemetrySchema = z.object({
    /** Whether telemetry is enabled. Defaults to true when absent. */
    enabled: z.boolean().optional()
});

export type FernRcTelemetrySchema = z.infer<typeof FernRcTelemetrySchema>;
