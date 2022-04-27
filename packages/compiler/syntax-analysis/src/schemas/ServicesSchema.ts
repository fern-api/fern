import { z } from "zod";
import { HttpServiceSchema } from "./HttpServiceSchema";
import { WebSocketServiceSchema } from "./WebSocketServiceSchema";

export const ServicesSchema = z.strictObject({
    http: z.optional(z.record(HttpServiceSchema)),
    websocket: z.optional(z.record(WebSocketServiceSchema)),
});

export type ServicesSchema = z.infer<typeof ServicesSchema>;
