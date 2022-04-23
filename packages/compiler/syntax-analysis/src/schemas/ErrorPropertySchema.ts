import { z } from "zod";
import { TypeReferenceWithDocsSchema } from "./TypeReferenceSchema";

export const ErrorPropertySchema = TypeReferenceWithDocsSchema;

export type ErrorPropertySchema = z.infer<typeof ErrorPropertySchema>;
