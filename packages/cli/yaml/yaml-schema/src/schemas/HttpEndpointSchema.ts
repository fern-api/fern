import { z } from "zod";
import { DeclarationSchema } from "./DeclarationSchema";
import { HttpHeaderSchema } from "./HttpHeaderSchema";
import { HttpPathParameterSchema } from "./HttpPathParameterSchema";
import { HttpQueryParameterSchema } from "./HttpQueryParameterSchema";
import { HttpRequestSchema } from "./HttpRequestSchema";
import { HttpResponseSchema } from "./HttpResponseSchema";
import { ResponseErrorsSchema } from "./ResponseErrorsSchema";

export const HttpEndpointSchema = DeclarationSchema.extend({
    method: z.optional(z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"])),
    path: z.string(),
    ["path-parameters"]: z.optional(z.record(HttpPathParameterSchema)),
    ["query-parameters"]: z.optional(z.record(HttpQueryParameterSchema)),
    headers: z.optional(z.record(HttpHeaderSchema)),
    auth: z.optional(z.boolean()),
    request: z.optional(HttpRequestSchema),
    response: z.optional(HttpResponseSchema),
    errors: z.optional(ResponseErrorsSchema),
});

export type HttpEndpointSchema = z.infer<typeof HttpEndpointSchema>;
