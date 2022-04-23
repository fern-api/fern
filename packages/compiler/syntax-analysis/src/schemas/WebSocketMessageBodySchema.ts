import { z } from "zod";
import { WireMessageSchema } from "./WireMessageSchema";

export const WebSocketMessageBodySchema = WireMessageSchema;

export type WebSocketMessageBodySchema = z.infer<typeof WebSocketMessageBodySchema>;
