import { z } from "zod";
import { inlinableType } from "./utils/inlinableType";
import { WithDocsSchema } from "./utils/WithDocsSchema";

export const IdSchema = inlinableType(WithDocsSchema.shape);
export type IdSchema = z.infer<typeof IdSchema>;
