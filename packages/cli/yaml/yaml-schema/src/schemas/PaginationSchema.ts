import { z } from "zod";

export const PaginationSchema = z.object({
    page: z.string(),
    next: z.string(),
    results: z.string()
});

export type PaginationSchema = z.infer<typeof PaginationSchema>;
