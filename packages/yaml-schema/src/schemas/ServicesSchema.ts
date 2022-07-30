import { z } from "zod";
import { HttpServiceSchema } from "./HttpServiceSchema";
import { WebSocketChannelSchema } from "./WebSocketChannelSchema";

export const ServicesSchema = z.strictObject({
    http: z.record(HttpServiceSchema).optional(),
    websocket: z.record(WebSocketChannelSchema).optional(),
});

export type ServicesSchema = z.infer<typeof ServicesSchema>;
