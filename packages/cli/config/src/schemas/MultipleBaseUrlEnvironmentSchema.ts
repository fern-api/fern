import { z } from "zod";

export const MultipleBaseUrlsEnvironmentSchema = z.object({
    urls: z.record(z.string(), z.string()),
    docs: z.string().optional()
});

export type MultipleBaseUrlsEnvironmentSchema = z.infer<typeof MultipleBaseUrlsEnvironmentSchema>;
