import { z } from "zod";
import { inlinableType } from "./utils/inlinableType";
import { WithDocsSchema } from "./utils/WithDocsSchema";

export const HttpHeaderSchema = inlinableType(WithDocsSchema.shape);

export type HttpHeaderSchema = z.infer<typeof HttpHeaderSchema>;
