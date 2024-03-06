import { z } from "zod";

export const CursorPaginationSchema = z.object({
    type: z.literal("cursor").describe("Configures cursor auto-pagination."),
    page: z.string().describe("The request property name that represents the page cursor."),
    next: z.string().describe("The response property name that represents the next page cursor to retrieve."),
    results: z.string().describe("The response property name that represents the page elements.")
});

export type CursorPaginationSchema = z.infer<typeof CursorPaginationSchema>;
