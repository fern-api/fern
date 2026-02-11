import { z } from "zod";

export const BaseDependencyConfig: z.ZodObject<
    { version: z.ZodString; extras: z.ZodOptional<z.ZodArray<z.ZodString, "many">> },
    "strip",
    z.ZodTypeAny,
    { version: string; extras?: Array<string> | undefined },
    { version: string; extras?: Array<string> | undefined }
> = z.object({
    version: z.string(),
    extras: z.array(z.string()).optional()
});

export type BaseDependencyConfig = z.infer<typeof BaseDependencyConfig>;
