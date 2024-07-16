import { z } from "zod";
import { ExampleCodeSampleSchema, UnresolvedExampleCodeSampleSchema } from "./ExampleCodeSampleSchema";
import { ExampleResponseSchema } from "./ExampleResponseSchema";
import { ExampleTypeReferenceSchema } from "./ExampleTypeReferenceSchema";
import { WithNameAndDocsSchema } from "./WithNameAndDocsSchema";

export const UnresolvedExampleEndpointCallSchema = WithNameAndDocsSchema.extend({
    id: z.optional(z.string()),
    "path-parameters": z.optional(z.record(z.string(), ExampleTypeReferenceSchema)),
    "query-parameters": z.optional(z.record(z.string(), ExampleTypeReferenceSchema)),
    headers: z.optional(z.record(z.string(), ExampleTypeReferenceSchema)),
    request: z.optional(ExampleTypeReferenceSchema),
    response: z.optional(ExampleResponseSchema),
    "code-samples": z.optional(z.array(UnresolvedExampleCodeSampleSchema))
});

export type UnresolvedExampleEndpointCallSchema = z.infer<typeof UnresolvedExampleEndpointCallSchema>;

export const UnresolvedExampleEndpointCallArraySchema = z.array(UnresolvedExampleEndpointCallSchema);

export type UnresolvedExampleEndpointCallArraySchema = z.infer<typeof UnresolvedExampleEndpointCallArraySchema>;

export const ExampleEndpointCallSchema = UnresolvedExampleEndpointCallSchema.extend({
    "code-samples": z.optional(z.array(ExampleCodeSampleSchema))
});

export type ExampleEndpointCallSchema = z.infer<typeof ExampleEndpointCallSchema>;
