import { z } from "zod";
import { BaseServiceSchema } from "./BaseServiceSchema";
import { EncodableTypeDefinitionSchema } from "./EncodableTypeDefinitionSchema";
import { WebSocketMessengerSchema } from "./WebSocketMessengerSchema";

export const WebSocketChannelSchema = BaseServiceSchema.merge(
    z.strictObject({
        path: z.string(),
        init: z.optional(EncodableTypeDefinitionSchema),
        client: z.optional(WebSocketMessengerSchema),
        server: z.optional(WebSocketMessengerSchema),
    })
);

export type WebSocketChannelSchema = z.infer<typeof WebSocketChannelSchema>;
