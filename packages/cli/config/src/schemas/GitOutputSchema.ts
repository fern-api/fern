import { z } from "zod";

export const GitOutputSchema = z.object({
    repository: z.string()
});

export type GitOutputSchema = z.infer<typeof GitOutputSchema>;
