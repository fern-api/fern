import { z } from "zod";
import { inlinableType } from "./utils/inlinableType";
import { WithDocsSchema } from "./utils/WithDocsSchema";

export const HttpQueryParameterSchema = inlinableType(WithDocsSchema.shape);

export type HttpQueryParameterSchema = z.infer<typeof HttpQueryParameterSchema>;
