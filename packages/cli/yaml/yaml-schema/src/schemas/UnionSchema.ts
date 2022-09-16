import { z } from "zod";
import { SingleUnionTypeSchema } from "./SingleUnionTypeSchema";
import { UnionDiscriminantSchema } from "./UnionDiscriminantSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const UnionSchema = WithDocsSchema.extend({
    union: z.record(SingleUnionTypeSchema),
    discriminant: z.optional(z.union([z.string(), UnionDiscriminantSchema])),
});

export type UnionSchema = z.infer<typeof UnionSchema>;
