import { z } from "zod";
import { TypeReferenceWithDocsAndNameSchema } from "./TypeReferenceSchema";

export const ObjectPropertySchema = TypeReferenceWithDocsAndNameSchema;

export type ObjectPropertySchema = z.infer<typeof ObjectPropertySchema>;
