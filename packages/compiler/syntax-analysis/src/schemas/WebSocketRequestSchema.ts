import { z } from "zod";
import { EncodableTypeDefinitionSchema } from "./EncodableTypeDefinitionSchema";

export const WebSocketRequestSchema = EncodableTypeDefinitionSchema;

export type WebSocketRequestSchema = z.infer<typeof WebSocketRequestSchema>;
