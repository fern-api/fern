import { z } from "zod";
import { DeclarationSchema } from "./DeclarationSchema";
import { ExampleTypeSchema } from "./ExampleTypeSchema";
import { ProtobufSourceTypeSchema } from "./ProtobufSourceTypeSchema";

export const BaseTypeDeclarationSchema = DeclarationSchema.extend({
    examples: z.optional(z.array(ExampleTypeSchema)),
    proto: z.optional(ProtobufSourceTypeSchema)
});

export type BaseTypeDeclarationSchema = z.infer<typeof BaseTypeDeclarationSchema>;
