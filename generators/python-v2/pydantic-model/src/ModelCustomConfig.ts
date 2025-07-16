import { z } from "zod";

export const PydanticModelCustomConfigSchema = z.object({
    include_union_utils: z.optional(z.boolean()),
    version: z.optional(z.enum(["both", "v1", "v2"])),
    include_validators: z.optional(z.boolean())
});

export type PydanticModelCustomConfigSchema = z.infer<typeof PydanticModelCustomConfigSchema>;
