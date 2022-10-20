import { z } from "zod";
import { TypeReferenceDeclarationSchema } from "./TypeReferenceSchema";

export const HttpPathParameterSchema = TypeReferenceDeclarationSchema;

export type HttpPathParameterSchema = z.infer<typeof HttpPathParameterSchema>;
