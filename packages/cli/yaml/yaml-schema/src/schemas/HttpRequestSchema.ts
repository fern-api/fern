import { z } from "zod";
import { HttpHeaderSchema } from "./HttpHeaderSchema";
import { HttpQueryParameterSchema } from "./HttpQueryParameterSchema";
import { HttpRequestBodySchema } from "./HttpRequestBodySchema";
import { WithNameSchema } from "./WithNameSchema";

export const HttpRequestSchema = WithNameSchema.extend({
    ["content-type"]: z.optional(z.string()),
    ["query-parameters"]: z.optional(z.record(HttpQueryParameterSchema)),
    headers: z.optional(z.record(HttpHeaderSchema)),
    body: z.optional(HttpRequestBodySchema)
});

export type HttpRequestSchema = z.infer<typeof HttpRequestSchema>;
