import { z } from "zod";
import { inlinableType } from "./utils/inlinableType";
import { WithDocsSchema } from "./utils/WithDocsSchema";

export const ErrorArgumentSchema = inlinableType(WithDocsSchema.shape);

export type ErrorArgumentSchema = z.infer<typeof ErrorArgumentSchema>;
