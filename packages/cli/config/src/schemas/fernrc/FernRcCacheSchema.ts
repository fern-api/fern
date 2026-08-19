import { z } from "zod";

export const FernRcCacheSchema = z.object({
    /** Custom cache directory path */
    path: z.string().optional()
});

export type FernRcCacheSchema = z.infer<typeof FernRcCacheSchema>;
