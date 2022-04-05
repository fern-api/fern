import { z } from "zod";

export const WebSocketMessageResponseBehaviorSchema = z.enum(["ongoing", "request-response"]);

export type WebSocketMessageResponseBehaviorSchema = z.infer<typeof WebSocketMessageResponseBehaviorSchema>;
