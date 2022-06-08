import { z } from "zod";
import { HttpServiceSchema } from "./HttpServiceSchema";
import { WebSocketChannelSchema } from "./WebSocketChannelSchema";

export const ServicesSchema = z.strictObject({
    http: z.optional(z.record(HttpServiceSchema)),
    websocket: z.optional(z.record(WebSocketChannelSchema)),
});

export type ServicesSchema = z.infer<typeof ServicesSchema>;
