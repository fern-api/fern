import { z } from "zod";
import { TypeReferenceDeclarationWithContentType } from "./TypeReferenceSchema";

export const ObjectPropertySchema = TypeReferenceDeclarationWithContentType;

export type ObjectPropertySchema = z.infer<typeof ObjectPropertySchema>;
