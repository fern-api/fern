import { z } from "zod";
import { ErrorReferenceSchema } from "./ErrorReferenceSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const FailedResponseSchema = WithDocsSchema.extend({
    errors: z.optional(z.array(z.union([z.string(), ErrorReferenceSchema]))),
    discriminant: z.optional(z.string()),
});

export type FailedResponseSchema = z.infer<typeof FailedResponseSchema>;
