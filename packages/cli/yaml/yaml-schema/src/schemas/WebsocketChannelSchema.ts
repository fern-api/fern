import { z } from "zod";
import { DeclarationSchema } from "./DeclarationSchema";
import { ExampleWebsocketMessageQueue } from "./ExampleWebsocketMessageQueue";
import { HttpPathParameterSchema } from "./HttpPathParameterSchema";
import { HttpQueryParameterSchema } from "./HttpQueryParameterSchema";
import { WebsocketChannelMessageSchema } from "./WebsocketChannelMessageSchema";

export const WebsocketChannelSchema = DeclarationSchema.extend({
    auth: z.boolean(),
    path: z.string(),
    "display-name": z.optional(z.string()),
    "path-parameters": z.optional(z.record(z.string(), HttpPathParameterSchema)),
    "query-parameters": z.optional(z.record(z.string(), HttpQueryParameterSchema)),
    messages: z.optional(z.record(z.string(), WebsocketChannelMessageSchema)),
    examples: z.optional(z.array(ExampleWebsocketMessageQueue))
});

export type WebsocketChannelSchema = z.infer<typeof WebsocketChannelSchema>;
