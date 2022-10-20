import { z } from "zod";
import { DeclarationSchema } from "./DeclarationSchema";

export const EnumValueSchema = z.union([
    z.string(),
    DeclarationSchema.extend({
        name: z.optional(z.string()),
        value: z.string(),
    }),
]);

export type EnumValueSchema = z.infer<typeof EnumValueSchema>;
