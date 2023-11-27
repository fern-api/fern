import { z } from "zod";
import { DeclarationSchema } from "./DeclarationSchema";
import { ExampleTypeSchema } from "./ExampleTypeSchema";

export const BaseTypeDeclarationSchema = DeclarationSchema.extend({
    examples: z.optional(z.array(ExampleTypeSchema))
});

export type BaseTypeDeclarationSchema = z.infer<typeof BaseTypeDeclarationSchema>;
