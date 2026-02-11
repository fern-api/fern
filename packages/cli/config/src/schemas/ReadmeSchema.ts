import { z } from "zod";

export const ReadmeSchema: z.ZodObject<{ defaultEndpoint: z.ZodOptional<z.ZodString> }, z.core.$strip> = z.object({
    defaultEndpoint: z.string().optional()
});

export type ReadmeSchema = z.infer<typeof ReadmeSchema>;
