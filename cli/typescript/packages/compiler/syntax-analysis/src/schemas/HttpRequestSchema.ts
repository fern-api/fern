import { z } from "zod";
import { inlinableType } from "./utils/inlinableType";
import { WithDocsSchema } from "./utils/WithDocsSchema";

export const HttpRequestSchema = inlinableType(WithDocsSchema.shape);

export type HttpRequestSchema = z.infer<typeof HttpRequestSchema>;
