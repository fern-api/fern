import { z } from "zod";
import { SingleUnionTypeSchema } from "./SingleUnionTypeSchema";
import { WithDocsSchema } from "./utils/WithDocsSchema";

export const UnionSchema = z
    .strictObject({
        union: z.record(SingleUnionTypeSchema),
        discriminant: z.optional(z.string()),
    })
    .merge(WithDocsSchema);

export type UnionSchema = z.infer<typeof UnionSchema>;
