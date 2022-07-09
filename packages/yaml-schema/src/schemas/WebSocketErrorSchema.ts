import { z } from "zod";
import { TypeReferenceWithDocsSchema } from "./TypeReferenceSchema";

export const WebSocketErrorSchema = TypeReferenceWithDocsSchema;

export type WebSocketErrorSchema = z.infer<typeof WebSocketErrorSchema>;
