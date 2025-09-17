import { z } from "zod";

export const CustomReadmeSectionSchema = z.strictObject({
    title: z.string(),
    content: z.string()
});

export type CustomReadmeSectionSchema = z.infer<typeof CustomReadmeSectionSchema>;
