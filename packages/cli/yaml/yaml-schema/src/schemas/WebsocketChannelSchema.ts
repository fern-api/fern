import { z } from "zod";
import { DeclarationWithoutDocsSchema } from "./DeclarationSchema";
import { HttpPathParameterSchema } from "./HttpPathParameterSchema";
import { HttpQueryParameterSchema } from "./HttpQueryParameterSchema";
import { WebsocketChannelMessageSchema } from "./WebsocketChannelMessageSchema";
import { ExampleWebsocketMessageQueue } from "./ExampleWebsocketMessageQueue";

export const WebsocketChannelSchema = DeclarationWithoutDocsSchema.extend({
    auth: z.boolean(),
    path: z.string(),
    "display-name": z.optional(z.string()),
    "path-parameters": z.optional(z.record(z.string(), HttpPathParameterSchema)),
    "query-parameters": z.optional(z.record(z.string(), HttpQueryParameterSchema)),
    messages: z.optional(z.record(z.string(), WebsocketChannelMessageSchema)),
    examples: z.optional(z.array(ExampleWebsocketMessageQueue))
});

export type WebsocketChannelSchema = z.infer<typeof WebsocketChannelSchema>;
