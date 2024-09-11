import { z } from "zod";
import { SingleUnionTypeKeySchema } from "./SingleUnionTypeKeySchema";
import { WithNameAndDocsSchema } from "./WithNameAndDocsSchema";
import { WithAvailabilitySchema } from "./WithAvailabilitySchema";

export const SingleUnionTypeSchema = z.union([
    z.string(),
    WithAvailabilitySchema.extend(
        WithNameAndDocsSchema.extend({
            type: z.optional(
                z.union([
                    z.string(),
                    // allow "{}" as syntactic sugar for null
                    z.record(z.never())
                ])
            ),
            key: z.optional(z.union([z.string(), SingleUnionTypeKeySchema])),
            "display-name": z.optional(z.string())
        }).shape
    )
]);

export type SingleUnionTypeSchema = z.infer<typeof SingleUnionTypeSchema>;
