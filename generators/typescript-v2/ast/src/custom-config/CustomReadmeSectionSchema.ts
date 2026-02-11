import { z } from "zod";

// The full set of configuration options supported by the TypeScript SDK generator.
export const CustomReadmeSectionSchema: z.ZodObject<
    { title: z.ZodString; content: z.ZodString },
    "strict",
    z.ZodTypeAny,
    { title: string; content: string },
    { title: string; content: string }
> = z.strictObject({
    title: z.string(),
    content: z.string()
});

export type CustomReadmeSectionSchema = z.infer<typeof CustomReadmeSectionSchema>;
