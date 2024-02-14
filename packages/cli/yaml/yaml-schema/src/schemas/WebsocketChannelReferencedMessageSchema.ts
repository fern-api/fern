import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const WebsocketChannelReferencedMessageSchema = WithDocsSchema.extend({
    type: z.string()
});

export type WebsocketChannelReferencedMessageSchema = z.infer<typeof WebsocketChannelReferencedMessageSchema>;
