import { z } from "zod";
import { DeclarationSchema } from "./DeclarationSchema";
import { ExampleWebhookCallSchema } from "./ExampleWebhookCallSchema";
import { HttpHeaderSchema } from "./HttpHeaderSchema";
import { WebhookPayloadSchema } from "./WebhookPayloadSchema";
import { WithDisplayNameSchema } from "./WithDisplayNameSchema";

export const WebhookSchema = DeclarationSchema.extend({
    method: z.enum(["GET", "POST"]),
    headers: z.optional(z.record(HttpHeaderSchema)),
    payload: WebhookPayloadSchema,
    examples: z.optional(z.array(ExampleWebhookCallSchema))
}).extend(WithDisplayNameSchema.shape);

export type WebhookSchema = z.infer<typeof WebhookSchema>;
