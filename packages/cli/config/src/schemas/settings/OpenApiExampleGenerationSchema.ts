import { z } from "zod";

import { ExampleGenerationSchema } from "./ExampleGenerationSchema";

/**
 * Schema for fine-tuning example generation in OpenAPI specs.
 */
export const OpenApiExampleGenerationSchema: z.ZodObject<
    {
        request: z.ZodOptional<z.ZodObject<{ maxDepth: z.ZodOptional<z.ZodNumber> }, z.core.$strip>>;
        response: z.ZodOptional<z.ZodObject<{ maxDepth: z.ZodOptional<z.ZodNumber> }, z.core.$strip>>;
    },
    z.core.$strip
> = z.object({
    request: ExampleGenerationSchema.optional(),
    response: ExampleGenerationSchema.optional()
});

export type OpenApiExampleGenerationSchema = z.infer<typeof OpenApiExampleGenerationSchema>;
