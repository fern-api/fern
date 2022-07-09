import { z } from "zod";
import { TypeReferenceWithDocsSchema } from "./TypeReferenceSchema";

export const SingleUnionTypeSchema = TypeReferenceWithDocsSchema;

export type SingleUnionTypeSchema = z.infer<typeof SingleUnionTypeSchema>;
