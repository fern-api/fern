import { z } from "zod";

export const FernRcCliSchema = z.object({
    /** The currently active CLI version (e.g. "1.2.3"). When unset, the running binary is used. */
    active_version: z.string().optional(),
    /** All CLI versions installed locally via `fern update`. */
    installed_versions: z.array(z.string()).default([])
});

export type FernRcCliSchema = z.infer<typeof FernRcCliSchema>;
