import { z } from "zod";
import { TypeReferenceWithDocsSchema } from "./TypeReferenceSchema";

export const HttpHeaderSchema = TypeReferenceWithDocsSchema;

export type HttpHeaderSchema = z.infer<typeof HttpHeaderSchema>;
