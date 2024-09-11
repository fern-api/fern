import { z } from "zod";
import { SingleUnionTypeKeySchema } from "./SingleUnionTypeKeySchema";
import { WithNameAndDocsSchema } from "./WithNameAndDocsSchema";
import { WithAvailabilitySchema } from "./WithAvailabilitySchema";
import { WithDisplayNameSchema } from "./WithDisplayNameSchema";

export const SingleUnionTypeSchema = z.union([
    z.string(),
    z
        .strictObject({
            type: z.optional(
                z.union([
                    z.string(),
                    // allow "{}" as syntactic sugar for null
                    z.record(z.never())
                ])
            ),
            key: z.optional(z.union([z.string(), SingleUnionTypeKeySchema]))
        })
        .extend(WithAvailabilitySchema.shape)
        .extend(WithNameAndDocsSchema.shape)
        .extend(WithDisplayNameSchema.shape)
]);

export type SingleUnionTypeSchema = z.infer<typeof SingleUnionTypeSchema>;
