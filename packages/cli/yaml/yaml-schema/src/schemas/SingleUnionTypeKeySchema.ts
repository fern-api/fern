import { z } from "zod";
import { WithNameSchema } from "./WithNameSchema";

export const SingleUnionTypeKeySchema = WithNameSchema.extend({
    value: z.string(),
});

export type SingleUnionTypeKeySchema = z.infer<typeof SingleUnionTypeKeySchema>;
