import { z } from "zod";
import { HttpErrorConfigurationSchema } from "./HttpErrorConfigurationSchema";
import { WithDocsSchema } from "./utils/WithDocsSchema";

export const ErrorSchema = WithDocsSchema.extend({
    http: z.optional(HttpErrorConfigurationSchema),
    bodyType: z.optional(z.string()),
});

export type ErrorSchema = z.infer<typeof ErrorSchema>;
