import { z } from "zod";
import { inlinableType } from "./utils/inlinableType";
import { WithDocsSchema } from "./utils/WithDocsSchema";

export const ObjectFieldSchema = inlinableType(WithDocsSchema.shape);

export type ObjectFieldSchema = z.infer<typeof ObjectFieldSchema>;
