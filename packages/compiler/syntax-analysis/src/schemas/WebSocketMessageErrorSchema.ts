import { z } from "zod";
import { TypeReferenceWithDocsSchema } from "./TypeReferenceSchema";

export const WebSocketMessageErrorSchema = TypeReferenceWithDocsSchema;

export type WebSocketMessageErrorSchema = z.infer<typeof WebSocketMessageErrorSchema>;
