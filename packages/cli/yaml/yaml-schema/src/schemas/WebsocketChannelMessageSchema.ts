import { z } from "zod";
import { WebsocketChannelMessageBodySchema } from "./WebsocketChannelMessageBodySchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const WebsocketChannelMessageSchema = WithDocsSchema.extend({
    origin: z.enum(["client", "server"]),
    body: WebsocketChannelMessageBodySchema
});

export type WebsocketChannelMessageSchema = z.infer<typeof WebsocketChannelMessageSchema>;
