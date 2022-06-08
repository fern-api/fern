import { z } from "zod";
import { BaseServiceSchema } from "./BaseServiceSchema";
import { WebSocketInitSchema } from "./WebSocketInitSchema";
import { WebSocketMessengerSchema } from "./WebSocketMessengerSchema";

export const WebSocketChannelSchema = BaseServiceSchema.merge(
    z.strictObject({
        path: z.string(),
        init: z.optional(WebSocketInitSchema),
        client: z.optional(WebSocketMessengerSchema),
        server: z.optional(WebSocketMessengerSchema),
    })
);

export type WebSocketChannelSchema = z.infer<typeof WebSocketChannelSchema>;
