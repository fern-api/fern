import { z } from "zod";
import { WithNameSchema } from "./WithNameSchema";

export const UnionDiscriminantSchema = WithNameSchema.extend({
    value: z.string()
});

export type UnionDiscriminantSchema = z.infer<typeof UnionDiscriminantSchema>;
