import { z } from "zod";

export const HeaderConfigSchema = z.object({
    name: z.string().optional(),
    env: z.string().optional(),
    docs: z.string().optional()
});

export type HeaderConfigSchema = z.infer<typeof HeaderConfigSchema>;
