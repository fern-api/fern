import { z } from "zod";
import { ExampleCodeSampleSchema } from "./ExampleCodeSampleSchema";
import { ExampleResponseSchema } from "./ExampleResponseSchema";
import { ExampleTypeReferenceSchema } from "./ExampleTypeReferenceSchema";
import { WithNameAndDocsSchema } from "./WithNameAndDocsSchema";

export const ExampleEndpointCallSchema = WithNameAndDocsSchema.extend({
    id: z.optional(z.string()),
    "path-parameters": z.optional(z.record(z.string(), ExampleTypeReferenceSchema)),
    "query-parameters": z.optional(z.record(z.string(), ExampleTypeReferenceSchema)),
    headers: z.optional(z.record(z.string(), ExampleTypeReferenceSchema)),
    request: z.optional(ExampleTypeReferenceSchema),
    response: z.optional(ExampleResponseSchema),
    "code-samples": z.optional(z.array(ExampleCodeSampleSchema))
});

export type ExampleEndpointCallSchema = z.infer<typeof ExampleEndpointCallSchema>;

export const ExampleEndpointCallArraySchema = z.array(ExampleEndpointCallSchema);

export type ExampleEndpointCallArraySchema = z.infer<typeof ExampleEndpointCallArraySchema>;
