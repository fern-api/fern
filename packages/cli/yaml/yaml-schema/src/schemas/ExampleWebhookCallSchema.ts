import { z } from "zod";
import { ExampleTypeReferenceSchema } from "./ExampleTypeReferenceSchema";
import { WithNameAndDocsSchema } from "./WithNameAndDocsSchema";

export const ExampleWebhookCallSchema = WithNameAndDocsSchema.extend({
    id: z.optional(z.string()),
    payload: z.optional(ExampleTypeReferenceSchema)
});

export type ExampleWebhookCallSchema = z.infer<typeof ExampleWebhookCallSchema>;

export const ExampleWebhookCallArraySchema = z.array(ExampleWebhookCallSchema);

export type ExampleWebhookCallArraySchema = z.infer<typeof ExampleWebhookCallArraySchema>;
