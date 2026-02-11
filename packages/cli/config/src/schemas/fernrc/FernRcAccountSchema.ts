import { z } from "zod";

export const FernRcAccountSchema: z.ZodObject<{ user: z.ZodString }, z.core.$strip> = z.object({
    /** Account identifier (email address) */
    user: z.string()
});

export type FernRcAccountSchema = z.infer<typeof FernRcAccountSchema>;
