import { z } from "zod";
import { HttpErrorConfigurationSchema } from "./HttpErrorConfigurationSchema";
import { TypeDeclarationSchema } from "./TypeDeclarationSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const ErrorDeclarationSchema = z.union([
    z.string(),
    WithDocsSchema.extend({
        http: z.optional(HttpErrorConfigurationSchema),
        type: z.optional(TypeDeclarationSchema),
    }),
]);

export type ErrorDeclarationSchema = z.infer<typeof ErrorDeclarationSchema>;
