import { z } from "zod";
import { ExampleTypeReferenceSchema } from "./ExampleTypeReferenceSchema";
import { ExampleWebSocketMessage } from "./ExampleWebSocketMessage";
import { WithNameAndDocsSchema } from "./WithNameAndDocsSchema";

export const ExampleWebSocketSession = WithNameAndDocsSchema.extend({
    "path-parameters": z.optional(z.record(z.string(), ExampleTypeReferenceSchema)),
    "query-parameters": z.optional(z.record(z.string(), ExampleTypeReferenceSchema)),
    headers: z.optional(z.record(z.string(), ExampleTypeReferenceSchema)),
    messages: z.array(ExampleWebSocketMessage)
});

export type ExampleWebSocketSession = z.infer<typeof ExampleWebSocketSession>;
