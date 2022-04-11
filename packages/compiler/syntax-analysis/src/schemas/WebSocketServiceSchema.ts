import { z } from "zod";
import { BaseServiceSchema } from "./BaseServiceSchema";
import { WebSocketMessageSchema } from "./WebSocketMessageSchema";

export const WebSocketServiceSchema = BaseServiceSchema.merge(
    z.strictObject({
        messages: z.record(WebSocketMessageSchema),
    })
);

export type WebSocketServiceSchema = z.infer<typeof WebSocketServiceSchema>;
