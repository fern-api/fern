import { z } from "zod";

export const ReviewersSchema = z.object({
    teams: z.array(z.string()).optional(),
    users: z.array(z.string()).optional()
});

export type ReviewersSchema = z.infer<typeof ReviewersSchema>;
