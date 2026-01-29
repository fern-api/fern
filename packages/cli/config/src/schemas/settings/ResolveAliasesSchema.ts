import { z } from "zod";

/**
 * Schema for controlling alias resolution.
 */
export const ResolveAliasesSchema = z.union([
    z.boolean(),
    z.object({
        /** Names of alias types to exclude from resolving. */
        except: z.array(z.string()).optional()
    })
]);

export type ResolveAliasesSchema = z.infer<typeof ResolveAliasesSchema>;
