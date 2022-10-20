import { z } from "zod";
import { TypeReferenceDeclarationSchema } from "./TypeReferenceSchema";

export const WebSocketErrorSchema = TypeReferenceDeclarationSchema;

export type WebSocketErrorSchema = z.infer<typeof WebSocketErrorSchema>;
