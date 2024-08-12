import { z } from "zod";
import { DeclarationSchema } from "./DeclarationSchema";
import { EncodingSchema } from "./EncodingSchema";
import { ExampleTypeSchema } from "./ExampleTypeSchema";
import { SourceSchema } from "./SourceSchema";

export const BaseTypeDeclarationSchema = DeclarationSchema.extend({
    examples: z.optional(z.array(ExampleTypeSchema)),
    encoding: z.optional(EncodingSchema),
    source: z.optional(SourceSchema)
});

export type BaseTypeDeclarationSchema = z.infer<typeof BaseTypeDeclarationSchema>;
