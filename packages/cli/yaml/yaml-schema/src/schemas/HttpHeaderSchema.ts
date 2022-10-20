import { z } from "zod";
import { TypeReferenceDeclarationWithNameSchema } from "./TypeReferenceSchema";

export const HttpHeaderSchema = TypeReferenceDeclarationWithNameSchema;

export type HttpHeaderSchema = z.infer<typeof HttpHeaderSchema>;
