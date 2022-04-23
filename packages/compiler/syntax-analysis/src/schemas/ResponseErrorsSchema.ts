import { z } from "zod";
import { ErrorReferenceSchema } from "./ErrorReferenceSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const ResponseErrorsSchema = WithDocsSchema.extend({
    discriminant: z.optional(z.string()),
    union: z.optional(z.record(z.union([z.string(), ErrorReferenceSchema]))),
});

export type ResponseErrorsSchema = z.infer<typeof ResponseErrorsSchema>;
