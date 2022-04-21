import { z } from "zod";
import { ErrorPropertySchema } from "./ErrorPropertySchema";
import { HttpErrorConfigurationSchema } from "./HttpErrorConfigurationSchema";
import { WithDocsSchema } from "./utils/WithDocsSchema";

export const ErrorDefinitionSchema = WithDocsSchema.extend({
    http: z.optional(HttpErrorConfigurationSchema),
    bodyType: z.optional(z.string()),
    properties: z.optional(z.record(ErrorPropertySchema)),
});

export type ErrorDefinitionSchema = z.infer<typeof ErrorDefinitionSchema>;
