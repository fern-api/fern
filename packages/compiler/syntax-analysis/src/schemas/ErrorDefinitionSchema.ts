import { z } from "zod";
import { HttpErrorConfigurationSchema } from "./HttpErrorConfigurationSchema";
import { TypeDeclarationSchema } from "./TypeDeclarationSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const ErrorDefinitionSchema = WithDocsSchema.extend({
    http: z.optional(HttpErrorConfigurationSchema),
    type: z.optional(TypeDeclarationSchema),
});

export type ErrorDefinitionSchema = z.infer<typeof ErrorDefinitionSchema>;
