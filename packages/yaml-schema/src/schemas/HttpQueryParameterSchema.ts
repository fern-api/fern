import { z } from "zod";
import { TypeReferenceWithDocsSchema } from "./TypeReferenceSchema";

export const HttpQueryParameterSchema = TypeReferenceWithDocsSchema;

export type HttpQueryParameterSchema = z.infer<typeof HttpQueryParameterSchema>;
