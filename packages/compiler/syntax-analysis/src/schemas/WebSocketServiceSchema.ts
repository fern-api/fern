import { z } from "zod";
import { BaseServiceSchema } from "./BaseServiceSchema";
import { EncodableTypeDefinitionSchema } from "./EncodableTypeDefinitionSchema";
import { WebSocketMessengerSchema } from "./WebSocketMessengerSchema";

export const WebSocketServiceSchema = BaseServiceSchema.merge(
    z.strictObject({
        path: z.string(),
        init: z.optional(EncodableTypeDefinitionSchema),
        client: WebSocketMessengerSchema,
        server: WebSocketMessengerSchema,
    })
);

export type WebSocketServiceSchema = z.infer<typeof WebSocketServiceSchema>;
