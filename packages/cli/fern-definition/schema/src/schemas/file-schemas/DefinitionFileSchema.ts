import { z } from "zod";
import { ErrorDeclarationSchema } from "../ErrorDeclarationSchema";
import { HttpServiceSchema } from "../HttpServiceSchema";
import { TypeDeclarationSchema } from "../TypeDeclarationSchema";
import { WebhookSchema } from "../WebhookSchema";
import { WebSocketChannelSchema } from "../WebSocketChannelSchema";

export const DefinitionFileSchema = z.strictObject({
    docs: z.optional(z.string()),
    imports: z.optional(z.record(z.string())),
    types: z.optional(z.record(TypeDeclarationSchema)),
    service: z.optional(HttpServiceSchema),
    webhooks: z.optional(z.record(WebhookSchema)),
    channel: z.optional(WebSocketChannelSchema),
    errors: z.optional(z.record(ErrorDeclarationSchema))
});

export type DefinitionFileSchema = z.infer<typeof DefinitionFileSchema>;
