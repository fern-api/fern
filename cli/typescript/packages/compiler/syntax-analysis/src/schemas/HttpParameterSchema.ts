import { z } from "zod";
import { inlinableType } from "./utils/inlinableType";
import { WithDocsSchema } from "./utils/WithDocsSchema";

export const HttpParameterSchema = inlinableType(WithDocsSchema.shape);

export type HttpParameterSchema = z.infer<typeof HttpParameterSchema>;
