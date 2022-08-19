import { z } from "zod";
import { TypeReferenceWithDocsAndNameSchema } from "./TypeReferenceSchema";

export const HttpQueryParameterSchema = TypeReferenceWithDocsAndNameSchema;

export type HttpQueryParameterSchema = z.infer<typeof HttpQueryParameterSchema>;
