import { z } from "zod";
import { WebhookInlinedPayloadSchema } from "./WebhookInlinedPayloadSchema";
import { WebhookReferencedPayloadSchema } from "./WebhookReferencedPayloadSchema";

export const WebhookPayloadSchema = z.union([z.string(), WebhookReferencedPayloadSchema, WebhookInlinedPayloadSchema]);

export type WebhookPayloadSchema = z.infer<typeof WebhookPayloadSchema>;
