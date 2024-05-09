import { z } from "zod";

export const StringPropertySchema = z.strictObject({
    minLength: z.number().optional(),
    maxLength: z.number().optional()
});

export const NumberPropertySchema = z.strictObject({
    min: z.number().optional(),
    max: z.number().optional()
});

export const ValidationPropertySchema = z.union([StringPropertySchema, NumberPropertySchema]);

export type ValidationPropertySchema = z.infer<typeof ValidationPropertySchema>;
