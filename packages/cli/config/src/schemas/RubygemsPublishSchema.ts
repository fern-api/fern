import { z } from "zod";

export const RubygemsPublishSchema: z.ZodObject<
    { packageName: z.ZodString; url: z.ZodOptional<z.ZodString>; apiKey: z.ZodOptional<z.ZodString> },
    z.core.$strip
> = z.object({
    packageName: z.string(),
    url: z.string().optional(),
    apiKey: z.string().optional()
});

export type RubygemsPublishSchema = z.infer<typeof RubygemsPublishSchema>;
