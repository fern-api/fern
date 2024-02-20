import { z } from "zod";
import { WebSocketChannelInlinedMessageSchema } from "./WebSocketChannelInlinedMessageSchema";
import { WebSocketChannelReferencedMessageSchema } from "./WebSocketChannelReferencedMessageSchema";

export const WebSocketChannelMessageBodySchema = z.union([
    z.string(),
    WebSocketChannelReferencedMessageSchema,
    WebSocketChannelInlinedMessageSchema
]);

export type WebSocketChannelMessageBodySchema = z.infer<typeof WebSocketChannelMessageBodySchema>;
