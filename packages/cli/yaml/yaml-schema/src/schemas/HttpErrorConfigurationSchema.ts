import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const HttpErrorConfigurationSchema = WithDocsSchema.extend({
    name: z.optional(z.string()),
    statusCode: z.number(),
});

export type HttpErrorConfigurationSchema = z.infer<typeof HttpErrorConfigurationSchema>;
