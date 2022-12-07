import { z } from "zod";
import { DeclarationSchema } from "./DeclarationSchema";
import { TypeExampleSchema } from "./TypeExampleSchema";

export const BaseTypeDeclarationSchema = DeclarationSchema.extend({
    examples: z.optional(z.array(TypeExampleSchema)),
});

export type BaseTypeDeclarationSchema = z.infer<typeof BaseTypeDeclarationSchema>;
