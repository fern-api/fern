import { z } from "zod";
import { BaseServiceSchema } from "./BaseServiceSchema";
import { HttpEndpointSchema } from "./HttpEndpointSchema";
import { HttpHeaderSchema } from "./HttpHeaderSchema";
import { HttpPathParameterSchema } from "./HttpPathParameterSchema";

export const HttpServiceSchema = BaseServiceSchema.extend({
    url: z.optional(z.string()),
    "base-path": z.string(),
    "path-parameters": z.optional(z.record(z.string(), HttpPathParameterSchema)),
    headers: z.optional(z.record(HttpHeaderSchema)),
    endpoints: z.record(HttpEndpointSchema),
});

export type HttpServiceSchema = z.infer<typeof HttpServiceSchema>;
