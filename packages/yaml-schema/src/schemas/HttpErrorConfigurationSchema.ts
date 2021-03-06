import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const HttpErrorConfigurationSchema = WithDocsSchema.extend({
    statusCode: z.number(),
});

export type HttpErrorConfigurationSchema = z.infer<typeof HttpErrorConfigurationSchema>;
