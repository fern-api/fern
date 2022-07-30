import { z } from "zod";
import { SingleUnionTypeSchema } from "./SingleUnionTypeSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const UnionSchema = WithDocsSchema.extend({
    union: z.record(SingleUnionTypeSchema),
    discriminant: z.string().optional(),
});

export type UnionSchema = z.infer<typeof UnionSchema>;
