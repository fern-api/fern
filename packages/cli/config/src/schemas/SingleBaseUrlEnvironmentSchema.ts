import { z } from "zod";

export const SingleBaseUrlEnvironmentSchema: z.ZodObject<
    { url: z.ZodString; docs: z.ZodOptional<z.ZodString> },
    z.core.$strip
> = z.object({
    url: z.string(),
    docs: z.string().optional()
});

export type SingleBaseUrlEnvironmentSchema = z.infer<typeof SingleBaseUrlEnvironmentSchema>;
