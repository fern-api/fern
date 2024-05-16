import { z } from "zod";

export const NumberRulesSchema = z.object({
    default: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    exclusiveMin: z.boolean().optional(),
    exclusiveMax: z.boolean().optional(),
    multipleOf: z.number().optional()
});

export type NumberRulesSchema = z.infer<typeof NumberRulesSchema>;
