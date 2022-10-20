import { z } from "zod";
import { TypeReferenceDeclarationWithNameSchema } from "./TypeReferenceSchema";

export const HttpQueryParameterSchema = TypeReferenceDeclarationWithNameSchema;

export type HttpQueryParameterSchema = z.infer<typeof HttpQueryParameterSchema>;
