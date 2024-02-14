import { z } from "zod";
import { WebsocketInlinedMessageSchema } from "./WebsocketInlinedMessageSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const WebsocketChannelMessageSchema = WithDocsSchema.extend({
    origin: z.enum(["client", "server"]),
    body: z.union([z.string(), WebsocketInlinedMessageSchema])
});

export type WebsocketChannelMessageSchema = z.infer<typeof WebsocketChannelMessageSchema>;
