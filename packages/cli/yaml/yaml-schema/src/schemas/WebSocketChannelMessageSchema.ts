import { z } from "zod";
import { WebSocketChannelMessageBodySchema } from "./WebSocketChannelMessageBodySchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const WebSocketChannelMessageSchema = WithDocsSchema.extend({
    origin: z.enum(["client", "server"]),
    body: WebSocketChannelMessageBodySchema
});

export type WebSocketChannelMessageSchema = z.infer<typeof WebSocketChannelMessageSchema>;
