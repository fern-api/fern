import { z } from "zod";
import { WebSocketMessageResponseBehaviorSchema } from "./WebSocketMessageResponseBehaviorSchema";
import { extendWireMessageSchema } from "./WireMessageSchema";

export const WebSocketMessageResponseSchema = extendWireMessageSchema({
    behavior: z.optional(WebSocketMessageResponseBehaviorSchema),
});

export type WebSocketMessageResponseSchema = z.infer<typeof WebSocketMessageResponseSchema>;
