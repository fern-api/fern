import { z } from "zod";
import { AuthSchema } from "./AuthSchema";
import { HttpHeaderSchema } from "./HttpHeaderSchema";
import { HttpParameterSchema } from "./HttpParameterSchema";
import { HttpQueryParameterSchema } from "./HttpQueryParameterSchema";
import { HttpRequestSchema } from "./HttpRequestSchema";
import { HttpResponseSchema } from "./HttpResponseSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const HttpEndpointSchema = WithDocsSchema.extend({
    method: z.optional(z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"])),
    path: z.optional(z.string()),
    ["path-parameters"]: z.optional(z.record(HttpParameterSchema)),
    ["query-parameters"]: z.optional(z.record(HttpQueryParameterSchema)),
    headers: z.optional(z.record(HttpHeaderSchema)),
    "auth-override": z.optional(AuthSchema),
    request: z.optional(HttpRequestSchema),
    response: z.optional(HttpResponseSchema),
});

export type HttpEndpointSchema = z.infer<typeof HttpEndpointSchema>;
