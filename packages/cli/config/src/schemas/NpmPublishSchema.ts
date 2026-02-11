import { z } from "zod";

export const NpmPublishSchema: z.ZodObject<
    { packageName: z.ZodString; url: z.ZodOptional<z.ZodString>; token: z.ZodOptional<z.ZodString> },
    z.core.$strip
> = z.object({
    packageName: z.string(),
    url: z.string().optional(),
    token: z.string().optional()
});

export type NpmPublishSchema = z.infer<typeof NpmPublishSchema>;
