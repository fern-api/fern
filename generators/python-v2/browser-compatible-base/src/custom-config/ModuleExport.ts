import { z } from "zod";

export const ModuleExport: z.ZodObject<
    { from: z.ZodOptional<z.ZodString>; imports: z.ZodOptional<z.ZodArray<z.ZodString, "many">> },
    "strip",
    z.ZodTypeAny,
    { from?: string | undefined; imports?: Array<string> | undefined },
    { from?: string | undefined; imports?: Array<string> | undefined }
> = z.object({
    from: z.string().optional(),
    imports: z.array(z.string()).optional()
});

export type ModuleExport = z.infer<typeof ModuleExport>;
