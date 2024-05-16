import { z } from "zod";

export const StringRulesSchema = z.object({
    default: z.string().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    pattern: z.string().optional(),
    format: z.string().optional()
});

export type StringRulesSchema = z.infer<typeof StringRulesSchema>;
