import { z } from "zod";

export const MultipleBaseUrlsEnvironmentSchema: z.ZodObject<
    { urls: z.ZodRecord<z.ZodString, z.ZodString>; docs: z.ZodOptional<z.ZodString> },
    z.core.$strip
> = z.object({
    urls: z.record(z.string(), z.string()),
    docs: z.string().optional()
});

export type MultipleBaseUrlsEnvironmentSchema = z.infer<typeof MultipleBaseUrlsEnvironmentSchema>;
