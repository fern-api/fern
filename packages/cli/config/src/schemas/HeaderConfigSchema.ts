import { z } from "zod";

export const HeaderConfigSchema: z.ZodObject<
    { name: z.ZodOptional<z.ZodString>; env: z.ZodOptional<z.ZodString>; docs: z.ZodOptional<z.ZodString> },
    z.core.$strip
> = z.object({
    name: z.string().optional(),
    env: z.string().optional(),
    docs: z.string().optional()
});

export type HeaderConfigSchema = z.infer<typeof HeaderConfigSchema>;
