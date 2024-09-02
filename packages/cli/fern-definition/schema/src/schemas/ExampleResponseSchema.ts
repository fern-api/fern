import { z } from "zod";
import { ExampleTypeReferenceSchema } from "./ExampleTypeReferenceSchema";

/**
 * response: unknown
 * examples:
 *  - name: example 1
 *    request:
 *      stream: false
 *    response:
 *      body: {}
 *
 */
export const ExampleBodyResponseSchema = z.strictObject({
    error: z.optional(z.string()),
    body: z.optional(ExampleTypeReferenceSchema)
});

export type ExampleBodyResponseSchema = z.infer<typeof ExampleBodyResponseSchema>;

/**
 * response-stream:
 *   type: unknown
 * examples:
 *  - name: example 1
 *    request:
 *      stream: true
 *    response:
 *      stream:
 *        - {} # event 1
 *        - {} # event 2
 */
export const ExampleStreamResponseSchema = z.strictObject({
    stream: z.array(ExampleTypeReferenceSchema)
});

export type ExampleStreamResponseSchema = z.infer<typeof ExampleStreamResponseSchema>;

export const ExampleSseEventSchema = z.strictObject({
    event: z.string(),
    data: z.optional(ExampleTypeReferenceSchema)
});

export type ExampleSseEventSchema = z.infer<typeof ExampleSseEventSchema>;

/**
 * response-stream:
 *   type: unknown
 *   format: sse
 * examples:
 * - name: example 1
 *   request:
 *     stream: true
 *   response:
 *     stream:
 *      - event: chat # event 1
 *        data: {}
 *      - event: chat # event 2
 *        data: {}
 */
export const ExampleSseResponseSchema = z.strictObject({
    stream: z.array(ExampleSseEventSchema)
});

export type ExampleSseResponseSchema = z.infer<typeof ExampleSseResponseSchema>;

export const ExampleResponseSchema = z.union([
    ExampleBodyResponseSchema,
    ExampleStreamResponseSchema,
    ExampleSseResponseSchema
]);

export type ExampleResponseSchema = z.infer<typeof ExampleResponseSchema>;
