import { z } from "zod";
import { HttpFileRequestBodySchema } from "./HttpFileRequestBodySchema";
import { HttpInlineRequestBodySchema } from "./HttpInlineRequestBodySchema";
import { HttpReferencedRequestBodySchema } from "./HttpReferencedRequestBodySchema";
export const HttpRequestBodySchema = z.union([
    z.string(),
    HttpReferencedRequestBodySchema,
    HttpInlineRequestBodySchema,
    HttpFileRequestBodySchema
]);

export type HttpRequestBodySchema = z.infer<typeof HttpRequestBodySchema>;
