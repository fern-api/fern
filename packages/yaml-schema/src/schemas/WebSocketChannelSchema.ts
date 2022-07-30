import { z } from "zod";
import { BaseServiceSchema } from "./BaseServiceSchema";
import { WebSocketMessengerSchema } from "./WebSocketMessengerSchema";

export const WebSocketChannelSchema = BaseServiceSchema.extend({
    path: z.string(),
    client: WebSocketMessengerSchema.optional(),
    server: WebSocketMessengerSchema.optional(),
});

export type WebSocketChannelSchema = z.infer<typeof WebSocketChannelSchema>;
