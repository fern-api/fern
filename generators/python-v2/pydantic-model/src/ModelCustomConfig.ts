import { z } from "zod";

export const PydanticModelCustomConfigSchema = z.object({
    include_union_utils: z.optional(z.boolean()),
    version: z.optional(z.enum(["both", "v1", "v2"]))
});

export type PydanticModelCustomConfigSchema = z.infer<typeof PydanticModelCustomConfigSchema>;
