import { z } from "zod";

export const NugetPublishSchema: z.ZodObject<
    { packageName: z.ZodString; url: z.ZodOptional<z.ZodString>; apiKey: z.ZodOptional<z.ZodString> },
    z.core.$strip
> = z.object({
    packageName: z.string(),
    url: z.string().optional(),
    apiKey: z.string().optional()
});

export type NugetPublishSchema = z.infer<typeof NugetPublishSchema>;
