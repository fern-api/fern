import { z } from "zod";
import { AuthSchema } from "./AuthSchema";
import { HttpHeaderSchema } from "./HttpHeaderSchema";
import { HttpParameterSchema } from "./HttpParameterSchema";
import { HttpQueryParameterSchema } from "./HttpQueryParameterSchema";
import { HttpRequestSchema } from "./HttpRequestSchema";
import { HttpResponseSchema } from "./HttpResponseSchema";
import { ResponseErrorsSchema } from "./ResponseErrorsSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const HttpEndpointSchema = WithDocsSchema.extend({
    method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).optional(),
    path: z.string().optional(),
    ["path-parameters"]: z.record(HttpParameterSchema).optional(),
    ["query-parameters"]: z.record(HttpQueryParameterSchema).optional(),
    headers: z.record(HttpHeaderSchema).optional(),
    "auth-override": AuthSchema.optional(),
    request: HttpRequestSchema.optional(),
    response: HttpResponseSchema.optional(),
    errors: ResponseErrorsSchema.optional(),
});

export type HttpEndpointSchema = z.infer<typeof HttpEndpointSchema>;
