import { z } from "zod";
import { WebsocketChannelInlinedMessageSchema } from "./WebsocketChannelInlinedMessageSchema";
import { WebsocketChannelReferencedMessageSchema } from "./WebsocketChannelReferencedMessageSchema";

export const WebsocketChannelMessageBodySchema = z.union([
    z.string(),
    WebsocketChannelReferencedMessageSchema,
    WebsocketChannelInlinedMessageSchema
]);

export type WebsocketChannelMessageBodySchema = z.infer<typeof WebsocketChannelMessageBodySchema>;
