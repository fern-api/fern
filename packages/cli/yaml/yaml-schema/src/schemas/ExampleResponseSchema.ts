import { z } from "zod";
import { ExampleTypeReferenceSchema } from "./ExampleTypeReferenceSchema";

export const ExampleResponseSchema = z.strictObject({
    error: z.optional(z.string()),
    body: z.optional(ExampleTypeReferenceSchema)
});

export type ExampleResponseSchema = z.infer<typeof ExampleResponseSchema>;
