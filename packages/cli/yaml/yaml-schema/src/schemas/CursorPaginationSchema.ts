import { z } from "zod";

export const CursorPaginationSchema = z.object({
    cursor: z.string().describe("The path to the request property for the cursor."),
    next_cursor: z.string().describe("The path to the response property for the next cursor."),
    results: z.string().describe("The path to the response property for the page elements.")
});

export type CursorPaginationSchema = z.infer<typeof CursorPaginationSchema>;
