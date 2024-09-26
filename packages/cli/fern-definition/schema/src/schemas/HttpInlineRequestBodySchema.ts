import { z } from "zod";
import { ObjectExtendsSchema } from "./ObjectExtendsSchema";
import { ObjectPropertySchema } from "./ObjectPropertySchema";
import { HttpInlineRequestBodyPropertySchema } from "./HttpInlineRequestBodyPropertySchema";
import { HttpInlineRequestEncoding } from "./HttpInlineRequestEncoding";

// for inline request schemas, you need either extends/properties (or both).
export const HttpInlineRequestBodySchema = z.union([
    z.strictObject({
        encoding: z.optional(HttpInlineRequestEncoding),
        extends: ObjectExtendsSchema,
        properties: z.optional(z.record(HttpInlineRequestBodyPropertySchema)),
        ["extra-properties"]: z.optional(z.boolean())
    }),
    z.strictObject({
        encoding: z.optional(HttpInlineRequestEncoding),
        extends: z.optional(ObjectExtendsSchema),
        properties: z.record(HttpInlineRequestBodyPropertySchema),
        ["extra-properties"]: z.optional(z.boolean())
    })
]);

export type HttpInlineRequestBodySchema = z.infer<typeof HttpInlineRequestBodySchema>;
