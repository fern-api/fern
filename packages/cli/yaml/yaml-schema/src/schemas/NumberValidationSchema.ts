import { z } from "zod";

export const NumberValidationSchema = z.strictObject({
    min: z.number().optional(),
    max: z.number().optional(),
    exclusiveMin: z.boolean().optional(),
    exclusiveMax: z.boolean().optional(),
    multipleOf: z.number().optional()
});

export type NumberValidationSchema = z.infer<typeof NumberValidationSchema>;
