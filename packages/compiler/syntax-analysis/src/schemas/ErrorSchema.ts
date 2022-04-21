import { z } from "zod";
import { ErrorArgumentSchema } from "./ErrorArgumentSchema";
import { HttpErrorConfigurationSchema } from "./HttpErrorConfigurationSchema";
import { WithDocsSchema } from "./utils/WithDocsSchema";

export const ErrorSchema = WithDocsSchema.extend({
    http: z.optional(HttpErrorConfigurationSchema),
    bodyType: z.optional(z.string()),
    args: z.optional(z.record(ErrorArgumentSchema)),
});

export type ErrorSchema = z.infer<typeof ErrorSchema>;
