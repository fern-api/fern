import { record, z } from "zod";
import { SingleUnionTypeSchema } from "./SingleUnionTypeSchema";
import { WithDocsSchema } from "./utils/WithDocsSchema";

export const UnionSchema = z
    .strictObject({
        union: record(SingleUnionTypeSchema),
    })
    .merge(WithDocsSchema);

export type UnionSchema = z.infer<typeof UnionSchema>;
