import { z } from "zod";
import { DeclarationSchema } from "./DeclarationSchema";
import { EncodingSchema } from "./EncodingSchema";
import { ExampleTypeSchema } from "./ExampleTypeSchema";

export const BaseTypeDeclarationSchema = DeclarationSchema.extend({
    examples: z.optional(z.array(ExampleTypeSchema)),
    encoding: z.optional(EncodingSchema)
});

export type BaseTypeDeclarationSchema = z.infer<typeof BaseTypeDeclarationSchema>;
