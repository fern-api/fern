import { z } from "zod";

export const ReadmeSchema = z.object({
    defaultEndpoint: z.string().optional()
});

export type ReadmeSchema = z.infer<typeof ReadmeSchema>;
