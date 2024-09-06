import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const ErrorReferenceSchema = WithDocsSchema.extend({
    error: z.string()
});

export type ErrorReferenceSchema = z.infer<typeof ErrorReferenceSchema>;
