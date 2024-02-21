import { z } from "zod";

export const ExpressCustomConfigSchema = z.strictObject({
    useBrandedStringAliases: z.optional(z.boolean()),
    optionalImplementations: z.optional(z.boolean()),
    doNotHandleUnrecognizedErrors: z.optional(z.boolean()),
    treatUnknownAsAny: z.optional(z.boolean()),
    noSerdeLayer: z.optional(z.boolean()),
    outputEsm: z.optional(z.boolean()),
    // beta (not in docs)
    outputSourceFiles: z.optional(z.boolean()),
    includeUtilsOnUnionMembers: z.optional(z.boolean()),
    includeOtherInUnionTypes: z.optional(z.boolean())
});

export type ExpressCustomConfigSchema = z.infer<typeof ExpressCustomConfigSchema>;
