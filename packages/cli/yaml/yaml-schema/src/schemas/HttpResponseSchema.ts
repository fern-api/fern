import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const HttpResponseSchema = z.union([
    z.string(),
    WithDocsSchema.extend({
        type: z.string(),
        ["response-property"]: z.optional(z.string()),
    }),
]);

export type HttpResponseSchema = z.infer<typeof HttpResponseSchema>;
