import { z } from "zod";

/**
 * The default encoding of form parameters.
 */
export const FormParameterEncodingSchema: z.ZodEnum<{ form: "form"; json: "json" }> = z.enum(["form", "json"]);

export type FormParameterEncodingSchema = z.infer<typeof FormParameterEncodingSchema>;
