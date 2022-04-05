import { z } from "zod";
import { inlinableType } from "./utils/inlinableType";
import { WithDocsSchema } from "./utils/WithDocsSchema";

export const WebSocketMessageBodySchema = inlinableType(WithDocsSchema.shape);

export type WebSocketMessageBodySchema = z.infer<typeof WebSocketMessageBodySchema>;
