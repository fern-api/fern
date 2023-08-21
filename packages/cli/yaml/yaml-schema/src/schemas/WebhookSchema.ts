import { z } from "zod";
import { DeclarationSchema } from "./DeclarationSchema";
import { WebhookPayloadSchema } from "./WebhookPayloadSchema";

export const WebhookSchema = DeclarationSchema.extend({
    method: z.optional(z.enum(["GET", "POST"])),
    "display-name": z.optional(z.string()),
    path: z.string(),
    payload: z.optional(z.union([z.string(), WebhookPayloadSchema])),
});

export type WebhookSchema = z.infer<typeof WebhookSchema>;
