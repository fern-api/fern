import { z } from "zod";

export const moduleConfigSchema: z.ZodObject<
    {
        path: z.ZodString;
        version: z.ZodOptional<z.ZodString>;
        imports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    },
    "strip",
    z.ZodTypeAny,
    { path: string; version?: string | undefined; imports?: Record<string, string> | undefined },
    { path: string; version?: string | undefined; imports?: Record<string, string> | undefined }
> = z.object({
    path: z.string(),
    version: z.string().optional(),
    imports: z.record(z.string(), z.string()).optional()
});

export type ModuleConfigSchema = z.infer<typeof moduleConfigSchema>;
