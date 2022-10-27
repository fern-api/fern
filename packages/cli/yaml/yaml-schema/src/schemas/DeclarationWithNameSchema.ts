import { z } from "zod";
import { DeclarationSchema } from "./DeclarationSchema";

export const DeclarationWithNameSchema = DeclarationSchema.extend({
    name: z.optional(z.string()),
});

export type DeclarationWithNameSchema = z.infer<typeof DeclarationWithNameSchema>;
