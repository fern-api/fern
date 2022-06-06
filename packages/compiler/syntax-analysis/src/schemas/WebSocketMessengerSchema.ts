import { z } from "zod";
import { WebSocketMessageSchema } from "./WebSocketMessageSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const WebSocketMessengerSchema = z
    .strictObject({
        messages: z.record(WebSocketMessageSchema),
    })
    .merge(WithDocsSchema);

export type WebSocketMessengerSchema = z.infer<typeof WebSocketMessengerSchema>;
