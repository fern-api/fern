import { z } from "zod";

export const SingleUnionTypeKeySchema = z.strictObject({
    name: z.optional(z.string()),
    value: z.string(),
});

export type SingleUnionTypeKeySchema = z.infer<typeof SingleUnionTypeKeySchema>;
