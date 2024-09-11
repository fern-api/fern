import { z } from "zod";
import { DeclarationSchema } from "./DeclarationSchema";
import { WebSocketChannelMessageBodySchema } from "./WebSocketChannelMessageBodySchema";
import { WithDisplayNameSchema } from "./WithDisplayNameSchema";

export const WebSocketChannelMessageSchema = DeclarationSchema.extend({
    origin: z.enum(["client", "server"]),
    body: WebSocketChannelMessageBodySchema
}).extend(WithDisplayNameSchema.shape);

export type WebSocketChannelMessageSchema = z.infer<typeof WebSocketChannelMessageSchema>;
