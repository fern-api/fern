import { z } from "zod";
import { BaseServiceSchema } from "./BaseServiceSchema";
import { HttpEndpointSchema } from "./HttpEndpointSchema";
import { HttpHeaderSchema } from "./HttpHeaderSchema";

export const HttpServiceSchema = BaseServiceSchema.merge(
    z.strictObject({
        headers: z.optional(z.record(HttpHeaderSchema)),
        endpoints: z.record(HttpEndpointSchema),
    })
);

export type HttpServiceSchema = z.infer<typeof HttpServiceSchema>;
