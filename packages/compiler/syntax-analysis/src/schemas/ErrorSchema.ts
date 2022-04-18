import { z } from "zod";
import { WithDocsSchema } from "./utils/WithDocsSchema";

export const ErrorSchema = WithDocsSchema.extend({
    httpStatusCode: z.optional(z.number()),
    bodyType: z.optional(z.string()),
});

export type ErrorSchema = z.infer<typeof ErrorSchema>;
