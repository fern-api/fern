import { z } from "zod";

/**
 * Schema for controlling example generation depth.
 */
export const ExampleGenerationSchema = z.object({
    /** Controls the maximum depth for which optional properties will have examples generated. A depth of 0 means no optional properties will have examples. */
    maxDepth: z.number().optional()
});

export type ExampleGenerationSchema = z.infer<typeof ExampleGenerationSchema>;
