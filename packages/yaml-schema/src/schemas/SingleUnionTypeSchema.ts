import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const SingleUnionTypeSchema = z.union([
    z.string(),
    WithDocsSchema.extend({
        type: z.optional(z.string()),
    }),
]);

export type SingleUnionTypeSchema = z.infer<typeof SingleUnionTypeSchema>;
