import { z } from "zod";
import { TypeReferenceWithDocsSchema } from "./TypeReferenceSchema";

export const HttpPathParameterSchema = TypeReferenceWithDocsSchema;

export type HttpPathParameterSchema = z.infer<typeof HttpPathParameterSchema>;
