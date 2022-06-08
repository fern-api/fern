import { z } from "zod";
import { HttpErrorConfigurationSchema } from "./HttpErrorConfigurationSchema";
import { TypeDefinitionSchema } from "./TypeDefinitionSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const ErrorDefinitionSchema = WithDocsSchema.extend({
    http: z.optional(HttpErrorConfigurationSchema),
    type: z.optional(TypeDefinitionSchema),
});

export type ErrorDefinitionSchema = z.infer<typeof ErrorDefinitionSchema>;
