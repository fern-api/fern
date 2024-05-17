import { z } from "zod";
import { TypeReferenceDeclarationWithNameSchema } from "./TypeReferenceSchema";

export const ObjectPropertySchema = TypeReferenceDeclarationWithNameSchema;

export type ObjectPropertySchema = z.infer<typeof ObjectPropertySchema>;
