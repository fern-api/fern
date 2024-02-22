import { z } from "zod";

export const PaginationSchema = z.object({
    page: z.string().describe("The request property name that represents the page cursor or offset."),
    next: z.string().describe("The response property name that represents the next page cursor or offset to retrieve."),
    results: z.string().describe("The response property name that represents the page elements.")
});

export type PaginationSchema = z.infer<typeof PaginationSchema>;
