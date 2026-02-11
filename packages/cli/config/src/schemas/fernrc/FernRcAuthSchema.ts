import { z } from "zod";
import { FernRcAccountSchema } from "./FernRcAccountSchema";

export const FernRcAuthSchema: z.ZodObject<
    {
        active: z.ZodOptional<z.ZodString>;
        accounts: z.ZodDefault<z.ZodArray<z.ZodObject<{ user: z.ZodString }, z.core.$strip>>>;
    },
    z.core.$strip
> = z.object({
    /** The currently active account identifier */
    active: z.string().optional(),
    /** List of all authenticated accounts */
    accounts: z.array(FernRcAccountSchema).default([])
});

export type FernRcAuthSchema = z.infer<typeof FernRcAuthSchema>;
