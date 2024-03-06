import { z } from "zod";

export const OPENAPI_DISABLE_EXAMPLES_KEY = "disable-examples";

export const GeneratorsOpenAPIObjectSchema = z.strictObject({
    path: z.optional(z.string()),
    overrides: z.optional(z.string()),
    [OPENAPI_DISABLE_EXAMPLES_KEY]: z.optional(z.boolean())
});

export type GeneratorsOpenAPIObjectSchema = z.infer<typeof GeneratorsOpenAPIObjectSchema>;
