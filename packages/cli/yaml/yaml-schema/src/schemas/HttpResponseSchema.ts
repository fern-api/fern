import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const HttpResponseSchema = z.union([
    z.string(),
    WithDocsSchema.extend({
        type: z.string(),
        property: z.optional(z.string()),
        "status-code": z.optional(z.number())
    })
]);

export type HttpResponseSchema = z.infer<typeof HttpResponseSchema>;
