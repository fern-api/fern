import { z } from "zod";
import { TypeReferenceWithDocsAndNameSchema } from "./TypeReferenceSchema";

export const HttpHeaderSchema = TypeReferenceWithDocsAndNameSchema;

export type HttpHeaderSchema = z.infer<typeof HttpHeaderSchema>;
