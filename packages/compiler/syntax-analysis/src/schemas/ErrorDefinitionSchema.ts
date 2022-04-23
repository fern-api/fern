import { z } from "zod";
import { ErrorPropertySchema } from "./ErrorPropertySchema";
import { HttpErrorConfigurationSchema } from "./HttpErrorConfigurationSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const ErrorDefinitionSchema = WithDocsSchema.extend({
    http: z.optional(HttpErrorConfigurationSchema),
    properties: z.optional(z.record(ErrorPropertySchema)),
});

export type ErrorDefinitionSchema = z.infer<typeof ErrorDefinitionSchema>;
