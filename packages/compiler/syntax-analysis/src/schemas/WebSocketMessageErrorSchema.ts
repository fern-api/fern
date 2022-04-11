import { z } from "zod";
import { inlinableType } from "./utils/inlinableType";
import { WithDocsSchema } from "./utils/WithDocsSchema";

export const WebSocketMessageErrorSchema = inlinableType(WithDocsSchema.shape);

export type WebSocketMessageErrorSchema = z.infer<typeof WebSocketMessageErrorSchema>;
