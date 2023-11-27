import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const HttpResponseStreamSchema = WithDocsSchema.extend({
    type: z.string(),
    terminator: z.optional(z.string())
});

export type HttpResponseStreamSchema = z.infer<typeof HttpResponseStreamSchema>;
