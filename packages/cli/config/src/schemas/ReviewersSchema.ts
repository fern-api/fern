import { z } from "zod";

export const ReviewersSchema: z.ZodObject<
    { teams: z.ZodOptional<z.ZodArray<z.ZodString>>; users: z.ZodOptional<z.ZodArray<z.ZodString>> },
    z.core.$strip
> = z.object({
    teams: z.array(z.string()).optional(),
    users: z.array(z.string()).optional()
});

export type ReviewersSchema = z.infer<typeof ReviewersSchema>;
