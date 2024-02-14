import { z } from "zod";

export const ExampleWebsocketMessage = z.object({
    type: z.string(),
    body: z.unknown()
});

export type ExampleWebsocketMessageQueue = z.infer<typeof ExampleWebsocketMessage>;
