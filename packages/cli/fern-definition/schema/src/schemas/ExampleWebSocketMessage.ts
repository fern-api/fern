import { z } from "zod";

export const ExampleWebSocketMessage = z.object({
    type: z.string(),
    body: z.unknown()
});

export type ExampleWebSocketMessage = z.infer<typeof ExampleWebSocketMessage>;
