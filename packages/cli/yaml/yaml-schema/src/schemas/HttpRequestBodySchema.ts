import { z } from "zod";
import { HttpInlineRequestBodySchema } from "./HttpInlineRequestBodySchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const HttpRequestBodySchema = z.union([
    z.string(),
    WithDocsSchema.extend({
        type: z.string(),
    }),
    HttpInlineRequestBodySchema,
]);

export type HttpRequestBodySchema = z.infer<typeof HttpRequestBodySchema>;
