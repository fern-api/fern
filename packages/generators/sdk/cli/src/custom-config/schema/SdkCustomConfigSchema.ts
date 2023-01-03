import { z } from "zod";

export const SdkCustomConfigSchema = z.strictObject({
    useBrandedStringAliases: z.optional(z.boolean()),
    private: z.optional(z.boolean()),
});

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
