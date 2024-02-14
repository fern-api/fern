import { z } from "zod";
import { ExampleTypeReferenceSchema } from "./ExampleTypeReferenceSchema";
import { ExampleWebsocketMessage } from "./ExampleWebsocketMessage";
import { WithNameAndDocsSchema } from "./WithNameAndDocsSchema";

export const ExampleWebsocketMessageQueue = WithNameAndDocsSchema.extend({
    "path-parameters": z.optional(z.record(z.string(), ExampleTypeReferenceSchema)),
    "query-parameters": z.optional(z.record(z.string(), ExampleTypeReferenceSchema)),
    messages: z.array(ExampleWebsocketMessage)
});

export type ExampleWebsocketMessageQueue = z.infer<typeof ExampleWebsocketMessageQueue>;
