import { z } from "zod";
import { DeclarationWithoutDocsSchema } from "./DeclarationSchema";
import { HttpEndpointSchema } from "./HttpEndpointSchema";
import { HttpHeaderSchema } from "./HttpHeaderSchema";
import { HttpPathParameterSchema } from "./HttpPathParameterSchema";
import { SourceSchema } from "./SourceSchema";
import { TransportSchema } from "./TransportSchema";

export const HttpServiceSchema = DeclarationWithoutDocsSchema.extend({
    auth: z.boolean(),
    url: z.optional(z.string()),
    "display-name": z.optional(z.string()),
    "base-path": z.string(),
    "path-parameters": z.optional(z.record(z.string(), HttpPathParameterSchema)),
    idempotent: z.optional(z.boolean()),
    headers: z.optional(z.record(HttpHeaderSchema)),
    transport: z.optional(TransportSchema),
    endpoints: z.record(HttpEndpointSchema),
    source: z.optional(SourceSchema)
});

export type HttpServiceSchema = z.infer<typeof HttpServiceSchema>;
