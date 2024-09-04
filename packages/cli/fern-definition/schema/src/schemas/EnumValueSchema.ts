import { z } from "zod";
import { CasingOverridesSchema } from "./CasingOverridesSchema";
import { WithNameAndDocsSchema } from "./WithNameAndDocsSchema";

export const EnumValueSchema = WithNameAndDocsSchema.extend({
    value: z.string(),
    casing: z.optional(CasingOverridesSchema)
});

export type EnumValueSchema = z.infer<typeof EnumValueSchema>;
