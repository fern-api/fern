import { z } from "zod";
import { TypeReferenceWithDocsSchema } from "./TypeReferenceSchema";

export const ObjectPropertySchema = TypeReferenceWithDocsSchema;

export type ObjectPropertySchema = z.infer<typeof ObjectPropertySchema>;
