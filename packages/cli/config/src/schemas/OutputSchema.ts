import { z } from "zod";
import { GitOutputSchema } from "./GitOutputSchema";

export const OutputSchema = z.object({
    path: z.string().optional(),
    git: GitOutputSchema.optional()
});

export type OutputSchema = z.infer<typeof OutputSchema>;
