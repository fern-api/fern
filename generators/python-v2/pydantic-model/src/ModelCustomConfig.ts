import { z } from "zod";

export const PydanticModelCustomConfigSchema: z.ZodObject<
    {
        include_union_utils: z.ZodOptional<z.ZodBoolean>;
        version: z.ZodOptional<z.ZodEnum<["both", "v1", "v2"]>>;
        include_validators: z.ZodOptional<z.ZodBoolean>;
    },
    "strip",
    z.ZodTypeAny,
    {
        version?: "v1" | "v2" | "both" | undefined;
        include_union_utils?: boolean | undefined;
        include_validators?: boolean | undefined;
    },
    {
        version?: "v1" | "v2" | "both" | undefined;
        include_union_utils?: boolean | undefined;
        include_validators?: boolean | undefined;
    }
> = z.object({
    include_union_utils: z.optional(z.boolean()),
    version: z.optional(z.enum(["both", "v1", "v2"])),
    include_validators: z.optional(z.boolean())
});

export type PydanticModelCustomConfigSchema = z.infer<typeof PydanticModelCustomConfigSchema>;
