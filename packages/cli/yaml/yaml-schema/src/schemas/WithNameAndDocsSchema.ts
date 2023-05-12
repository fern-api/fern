import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";
import { WithNameSchema } from "./WithNameSchema";

export const WithNameAndDocsSchema = WithNameSchema.extend(WithDocsSchema.shape);

export type WithNameAndDocsSchema = z.infer<typeof WithNameAndDocsSchema>;
