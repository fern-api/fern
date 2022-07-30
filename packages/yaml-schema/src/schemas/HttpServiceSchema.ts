import { z } from "zod";
import { BaseServiceSchema } from "./BaseServiceSchema";
import { HttpEndpointSchema } from "./HttpEndpointSchema";
import { HttpHeaderSchema } from "./HttpHeaderSchema";

export const HttpServiceSchema = BaseServiceSchema.extend({
    "base-path": z.string().optional(),
    headers: z.record(HttpHeaderSchema).optional(),
    endpoints: z.record(HttpEndpointSchema),
});

export type HttpServiceSchema = z.infer<typeof HttpServiceSchema>;
