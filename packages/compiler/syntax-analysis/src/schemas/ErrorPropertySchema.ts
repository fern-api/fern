import { z } from "zod";
import { inlinableType } from "./utils/inlinableType";
import { WithDocsSchema } from "./utils/WithDocsSchema";

export const ErrorPropertySchema = inlinableType(WithDocsSchema.shape);

export type ErrorPropertySchema = z.infer<typeof ErrorPropertySchema>;
