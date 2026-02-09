import { z } from "zod";
import { GitOutputSchema } from "./GitOutputSchema.js";

export const OutputSchema = z.object({
    path: z.string().optional(),
    git: GitOutputSchema.optional()
});

export type OutputSchema = z.infer<typeof OutputSchema>;
