import { z } from "zod";
import { HttpHeaderSchema } from "./HttpHeaderSchema";
import { HttpQueryParameterSchema } from "./HttpQueryParameterSchema";
import { HttpRequestBodySchema } from "./HttpRequestBodySchema";
import { WithNameAndDocsSchema } from "./WithNameAndDocsSchema";

export const HttpRequestSchema = WithNameAndDocsSchema.extend({
    ["content-type"]: z.optional(z.string()),
    ["query-parameters"]: z.optional(z.record(HttpQueryParameterSchema)),
    headers: z.optional(z.record(HttpHeaderSchema)),
    body: z.optional(HttpRequestBodySchema)
});

export type HttpRequestSchema = z.infer<typeof HttpRequestSchema>;
