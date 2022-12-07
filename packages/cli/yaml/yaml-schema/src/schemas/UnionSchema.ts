import { z } from "zod";
import { BaseTypeDeclarationSchema } from "./BaseTypeDeclarationSchema";
import { SingleUnionTypeSchema } from "./SingleUnionTypeSchema";
import { UnionDiscriminantSchema } from "./UnionDiscriminantSchema";

export const UnionSchema = BaseTypeDeclarationSchema.extend({
    union: z.record(SingleUnionTypeSchema),
    discriminant: z.optional(z.union([z.string(), UnionDiscriminantSchema])),
});

export type UnionSchema = z.infer<typeof UnionSchema>;
