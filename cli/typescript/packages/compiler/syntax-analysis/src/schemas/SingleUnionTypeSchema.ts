import { z } from "zod";
import { inlinableType } from "./utils/inlinableType";
import { WithDocsSchema } from "./utils/WithDocsSchema";

export const SingleUnionTypeSchema = inlinableType(WithDocsSchema.shape);

export type SingleUnionTypeSchema = z.infer<typeof SingleUnionTypeSchema>;
