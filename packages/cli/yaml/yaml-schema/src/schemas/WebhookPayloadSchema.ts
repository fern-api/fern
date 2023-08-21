import { z } from "zod";
import { HttpHeaderSchema } from "./HttpHeaderSchema";
import { HttpRequestBodySchema } from "./HttpRequestBodySchema";
import { WithNameSchema } from "./WithNameSchema";

export const WebhookPayloadSchema = WithNameSchema.extend({
    headers: z.optional(z.record(HttpHeaderSchema)),
    body: z.optional(HttpRequestBodySchema),
});

export type WebhookPayloadSchema = z.infer<typeof WebhookPayloadSchema>;
