import { z } from "zod";
import { FernRcAccountSchema } from "./FernRcAccountSchema.js";

export const FernRcAuthSchema = z.object({
    /** The currently active account identifier */
    active: z.string().optional(),
    /** List of all authenticated accounts */
    accounts: z.array(FernRcAccountSchema).default([])
});

export type FernRcAuthSchema = z.infer<typeof FernRcAuthSchema>;
