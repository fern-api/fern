import { z } from "zod";

// The full set of configuration options supported by the TypeScript SDK generator.
export const CustomReadmeSectionSchema = z.strictObject({
    title: z.string(),
    content: z.string(),
});

export type CustomReadmeSectionSchema = z.infer<typeof CustomReadmeSectionSchema>;