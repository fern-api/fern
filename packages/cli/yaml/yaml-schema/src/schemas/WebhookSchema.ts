import { z } from "zod";
import { DeclarationSchema } from "./DeclarationSchema";
import { ExampleWebhookCallSchema } from "./ExampleWebhookCallSchema";
import { HttpHeaderSchema } from "./HttpHeaderSchema";
import { WebhookPayloadSchema } from "./WebhookPayloadSchema";

export const WebhookSchema = DeclarationSchema.extend({
    method: z.enum(["GET", "POST"]),
    "display-name": z.optional(z.string()),
    headers: z.optional(z.record(HttpHeaderSchema)),
    payload: WebhookPayloadSchema,
    examples: z.optional(z.array(ExampleWebhookCallSchema))
});

export type WebhookSchema = z.infer<typeof WebhookSchema>;
