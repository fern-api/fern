import { z } from "zod";
import { SingleUnionTypeKeySchema } from "./SingleUnionTypeKeySchema";
import { WithNameAndDocsSchema } from "./WithNameAndDocsSchema";

export const SingleUnionTypeSchema = z.union([
    z.string(),
    WithNameAndDocsSchema.extend({
        type: z.optional(
            z.union([
                z.string(),
                // allow "{}" as syntactic sugar for null
                z.record(z.never()),
            ])
        ),
        key: z.optional(z.union([z.string(), SingleUnionTypeKeySchema])),
    }),
]);

export type SingleUnionTypeSchema = z.infer<typeof SingleUnionTypeSchema>;
