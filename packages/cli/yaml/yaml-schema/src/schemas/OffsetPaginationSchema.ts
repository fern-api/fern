import { z } from "zod";

export const OffsetPaginationSchema = z.object({
    offset: z.string().describe("The path to the request property for the page offset."),
    results: z.string().describe("The path to the response property for the page elements.")
});

export type OffsetPaginationSchema = z.infer<typeof OffsetPaginationSchema>;
