import { z } from "zod";
import { TypeReferenceWithDocsSchema } from "./TypeReferenceSchema";

export const VariableDeclarationSchema = TypeReferenceWithDocsSchema;

export type VariableDeclarationSchema = z.infer<typeof VariableDeclarationSchema>;
