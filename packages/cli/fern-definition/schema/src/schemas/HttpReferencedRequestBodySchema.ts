import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const HttpReferencedRequestBodySchema = WithDocsSchema.extend({
    type: z.string()
});

export type HttpReferencedRequestBodySchema = z.infer<typeof HttpReferencedRequestBodySchema>;
