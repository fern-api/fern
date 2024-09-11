import { z } from "zod";
import { DeclarationSchema } from "./DeclarationSchema";
import { ExampleWebSocketSession } from "./ExampleWebSocketSession";
import { HttpHeaderSchema } from "./HttpHeaderSchema";
import { HttpPathParameterSchema } from "./HttpPathParameterSchema";
import { HttpQueryParameterSchema } from "./HttpQueryParameterSchema";
import { WebSocketChannelMessageSchema } from "./WebSocketChannelMessageSchema";
import { WithDisplayNameSchema } from "./WithDisplayNameSchema";

export const WebSocketChannelSchema = DeclarationSchema.extend({
    auth: z.boolean(),
    path: z.string(),
    headers: z.optional(z.record(HttpHeaderSchema)),
    "path-parameters": z.optional(z.record(z.string(), HttpPathParameterSchema)),
    "query-parameters": z.optional(z.record(z.string(), HttpQueryParameterSchema)),
    messages: z.optional(z.record(z.string(), WebSocketChannelMessageSchema)),
    examples: z.optional(z.array(ExampleWebSocketSession))
}).extend(WithDisplayNameSchema.shape);

export type WebSocketChannelSchema = z.infer<typeof WebSocketChannelSchema>;
