import { z } from "zod";

export const StringValidationSchema = z.strictObject({
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    pattern: z.string().optional(),
    format: z.string().optional()
});

export type StringValidationSchema = z.infer<typeof StringValidationSchema>;
