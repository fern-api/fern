import { z } from "zod";
import { SingleUnionTypeKeySchema } from "./SingleUnionTypeKeySchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const SingleUnionTypeSchema = z.union([
    z.string(),
    WithDocsSchema.extend({
        name: z.optional(z.string()),
        type: z.optional(z.string()),
        key: z.optional(z.union([z.string(), SingleUnionTypeKeySchema])),
    }),
]);

export type SingleUnionTypeSchema = z.infer<typeof SingleUnionTypeSchema>;
