import { z } from "zod";
import { DeclarationSchema } from "./DeclarationSchema";
import { WebSocketChannelMessageBodySchema } from "./WebSocketChannelMessageBodySchema";

export const WebSocketChannelMessageSchema = DeclarationSchema.extend({
    origin: z.enum(["client", "server"]),
    body: WebSocketChannelMessageBodySchema,
    "display-name": z.string().optional()
});

export type WebSocketChannelMessageSchema = z.infer<typeof WebSocketChannelMessageSchema>;
