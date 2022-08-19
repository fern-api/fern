import { z } from "zod";
import { ErrorReferenceSchema } from "./ErrorReferenceSchema";

export const ResponseErrorsSchema = z.array(z.union([z.string(), ErrorReferenceSchema]));

export type ResponseErrorsSchema = z.infer<typeof ResponseErrorsSchema>;
