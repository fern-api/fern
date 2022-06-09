import { z } from "zod";
import { BaseServiceSchema } from "./BaseServiceSchema";
import { WebSocketMessengerSchema } from "./WebSocketMessengerSchema";

export const WebSocketChannelSchema = BaseServiceSchema.extend({
    path: z.string(),
    client: z.optional(WebSocketMessengerSchema),
    server: z.optional(WebSocketMessengerSchema),
});

export type WebSocketChannelSchema = z.infer<typeof WebSocketChannelSchema>;
