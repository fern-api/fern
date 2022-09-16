import { z } from "zod";

export const UnionDiscriminantSchema = z.strictObject({
    name: z.optional(z.string()),
    value: z.string(),
});

export type UnionDiscriminantSchema = z.infer<typeof UnionDiscriminantSchema>;
