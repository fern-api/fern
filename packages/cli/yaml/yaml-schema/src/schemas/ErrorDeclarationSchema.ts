import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const ErrorDeclarationSchema = WithDocsSchema.extend({
    "status-code": z.number(),
    type: z.optional(z.string())
});

export type ErrorDeclarationSchema = z.infer<typeof ErrorDeclarationSchema>;
