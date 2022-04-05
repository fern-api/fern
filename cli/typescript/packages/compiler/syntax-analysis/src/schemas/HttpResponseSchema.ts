import { z } from "zod";
import { inlinableType } from "./utils/inlinableType";
import { WithDocsSchema } from "./utils/WithDocsSchema";

export const HttpResponseSchema = inlinableType(WithDocsSchema.shape);

export type HttpResponseSchema = z.infer<typeof HttpResponseSchema>;
