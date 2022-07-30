import { z } from "zod";
import { WebSocketOperationSchema } from "./WebSocketOperationSchema";

export const WebSocketMessengerSchema = z.strictObject({
    operations: z.record(WebSocketOperationSchema).optional(),
});

export type WebSocketMessengerSchema = z.infer<typeof WebSocketMessengerSchema>;
