import { z } from "zod";
import { HttpHeaderSchema } from "./HttpHeaderSchema";
import { HttpQueryParameterSchema } from "./HttpQueryParameterSchema";
import { HttpRequestBodySchema } from "./HttpRequestBodySchema";

export const HttpRequestSchema = z.strictObject({
    name: z.optional(z.string()),
    ["query-parameters"]: z.optional(z.record(HttpQueryParameterSchema)),
    headers: z.optional(z.record(HttpHeaderSchema)),
    body: z.optional(HttpRequestBodySchema),
});

export type HttpRequestSchema = z.infer<typeof HttpRequestSchema>;
