import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const WebhookReferencedPayloadSchema = WithDocsSchema.extend({
    type: z.string()
});

export type WebhookReferencedPayloadSchema = z.infer<typeof WebhookReferencedPayloadSchema>;
