import { z } from "zod";

import { ExampleGenerationSchema } from "./ExampleGenerationSchema";

/**
 * Schema for fine-tuning example generation in OpenAPI specs.
 */
export const OpenApiExampleGenerationSchema = z.object({
    request: ExampleGenerationSchema.optional(),
    response: ExampleGenerationSchema.optional()
});

export type OpenApiExampleGenerationSchema = z.infer<typeof OpenApiExampleGenerationSchema>;
