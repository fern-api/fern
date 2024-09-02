import { z } from "zod";
import { HttpInlineRequestBodySchema } from "./HttpInlineRequestBodySchema";
import { HttpReferencedRequestBodySchema } from "./HttpReferencedRequestBodySchema";

export const HttpRequestBodySchema = z.union([
    z.string(),
    HttpReferencedRequestBodySchema,
    HttpInlineRequestBodySchema
]);

export type HttpRequestBodySchema = z.infer<typeof HttpRequestBodySchema>;
