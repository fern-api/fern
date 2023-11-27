import { z } from "zod";
import { BaseTypeDeclarationSchema } from "./BaseTypeDeclarationSchema";
import { ObjectExtendsSchema } from "./ObjectExtendsSchema";
import { ObjectPropertySchema } from "./ObjectPropertySchema";
import { SingleUnionTypeSchema } from "./SingleUnionTypeSchema";
import { UnionDiscriminantSchema } from "./UnionDiscriminantSchema";

export const DiscriminatedUnionSchema = BaseTypeDeclarationSchema.extend({
    "base-properties": z.optional(z.record(ObjectPropertySchema)),
    extends: z.optional(ObjectExtendsSchema),
    union: z.record(SingleUnionTypeSchema),
    discriminant: z.optional(z.union([z.string(), UnionDiscriminantSchema]))
});

export type DiscriminatedUnionSchema = z.infer<typeof DiscriminatedUnionSchema>;
