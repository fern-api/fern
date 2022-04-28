import { z } from "zod";
import { ErrorReferenceSchema } from "./ErrorReferenceSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const ResponseErrorsSchema = WithDocsSchema.extend({
    union: z.optional(z.record(z.union([z.string(), ErrorReferenceSchema]))),
    discriminant: z.optional(z.string()),
});

export type ResponseErrorsSchema = z.infer<typeof ResponseErrorsSchema>;
