import { z } from "zod";

export const OffsetPaginationSchema = z.object({
    type: z.literal("offset").describe("Configures offset auto-pagination."),
    page: z.string().describe("The request property name that represents the page offset."),
    results: z.string().describe("The response property name that represents the page elements.")
});

export type OffsetPaginationSchema = z.infer<typeof OffsetPaginationSchema>;
