import { z } from "zod";

export const SdkCustomConfigSchema = z.strictObject({
    useBrandedStringAliases: z.optional(z.boolean()),
    private: z.optional(z.boolean()),
    neverThrowErrors: z.optional(z.boolean()),
    namespaceExport: z.optional(z.string()),
    outputEsm: z.optional(z.boolean()),
    includeCredentialsOnCrossOriginRequests: z.optional(z.boolean()),
    bundle: z.optional(z.boolean()),
    allowCustomFetcher: z.optional(z.boolean()),
    includeUtilsOnUnionMembers: z.optional(z.boolean()),
    includeOtherInUnionTypes: z.optional(z.boolean()),
    requireDefaultEnvironment: z.optional(z.boolean()),
    timeoutInSeconds: z.optional(z.union([z.literal("infinity"), z.number()])),
    skipResponseValidation: z.optional(z.boolean()),
    extraDependencies: z.optional(z.record(z.string())),
});

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
