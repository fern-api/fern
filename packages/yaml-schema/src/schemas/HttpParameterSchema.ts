import { z } from "zod";
import { TypeReferenceWithDocsSchema } from "./TypeReferenceSchema";

export const HttpParameterSchema = TypeReferenceWithDocsSchema;

export type HttpParameterSchema = z.infer<typeof HttpParameterSchema>;
