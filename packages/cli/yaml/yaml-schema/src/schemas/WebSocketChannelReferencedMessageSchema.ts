import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const WebSocketChannelReferencedMessageSchema = WithDocsSchema.extend({
    type: z.string()
});

export type WebSocketChannelReferencedMessageSchema = z.infer<typeof WebSocketChannelReferencedMessageSchema>;
