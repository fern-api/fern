import { z } from "zod";
import { FernRcAuthSchema } from "./FernRcAuthSchema.js";

export const FernRcSchema = z.object({
    /** Config file version for migrations */
    version: z.literal("v1").default("v1"),
    /** Authentication settings */
    auth: FernRcAuthSchema.default({ accounts: [] })
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
