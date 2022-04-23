import { z } from "zod";
import { TypeReferenceWithDocsSchema } from "./TypeReferenceSchema";

export const ObjectFieldSchema = TypeReferenceWithDocsSchema;

export type ObjectFieldSchema = z.infer<typeof ObjectFieldSchema>;
