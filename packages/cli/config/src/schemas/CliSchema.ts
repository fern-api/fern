import { z } from "zod";

export const CliSchema = z.object({
    version: z.string().optional()
});

export type CliSchema = z.infer<typeof CliSchema>;
