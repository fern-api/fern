import { z } from "zod";

/**
 * Schema for controlling alias resolution.
 */
export const ResolveAliasesSchema: z.ZodUnion<
    readonly [z.ZodBoolean, z.ZodObject<{ except: z.ZodOptional<z.ZodArray<z.ZodString>> }, z.core.$strip>]
> = z.union([
    z.boolean(),
    z.object({
        /** Names of alias types to exclude from resolving. */
        except: z.array(z.string()).optional()
    })
]);

export type ResolveAliasesSchema = z.infer<typeof ResolveAliasesSchema>;
