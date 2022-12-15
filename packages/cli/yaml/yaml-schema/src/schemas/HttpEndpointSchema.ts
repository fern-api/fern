import { z } from "zod";
import { DeclarationSchema } from "./DeclarationSchema";
import { ExampleEndpointCallSchema } from "./ExampleEndpointCallSchema";
import { HttpPathParameterSchema } from "./HttpPathParameterSchema";
import { HttpRequestSchema } from "./HttpRequestSchema";
import { HttpResponseSchema } from "./HttpResponseSchema";
import { ResponseErrorsSchema } from "./ResponseErrorsSchema";

export const HttpEndpointSchema = DeclarationSchema.extend({
    method: z.optional(z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"])),
    path: z.string(),
    ["path-parameters"]: z.optional(z.record(HttpPathParameterSchema)),
    auth: z.optional(z.boolean()),
    request: z.optional(z.union([z.string(), HttpRequestSchema])),
    response: z.optional(HttpResponseSchema),
    errors: z.optional(ResponseErrorsSchema),
    examples: z.optional(z.array(ExampleEndpointCallSchema)),
});

export type HttpEndpointSchema = z.infer<typeof HttpEndpointSchema>;
