import { z } from "zod";

/**
 * The default encoding of form parameters.
 */
export const FormParameterEncodingSchema = z.enum(["form", "json"]);

export type FormParameterEncodingSchema = z.infer<typeof FormParameterEncodingSchema>;
