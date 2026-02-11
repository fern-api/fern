import { z } from "zod";
import { FernRcAuthSchema } from "./FernRcAuthSchema";

export const FernRcSchema: z.ZodObject<
    {
        version: z.ZodDefault<z.ZodLiteral<"v1">>;
        auth: z.ZodDefault<
            z.ZodObject<
                {
                    active: z.ZodOptional<z.ZodString>;
                    accounts: z.ZodDefault<z.ZodArray<z.ZodObject<{ user: z.ZodString }, z.core.$strip>>>;
                },
                z.core.$strip
            >
        >;
    },
    z.core.$strip
> = z.object({
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
